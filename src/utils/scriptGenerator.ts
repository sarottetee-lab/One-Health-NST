import { SheetMappingConfig, AppsScriptSettings } from '../types';

export function generateGoogleAppsScript(
  sheets: SheetMappingConfig[],
  settings: AppsScriptSettings
): string {
  const sheetsJson = JSON.stringify(
    sheets.map((s) => ({
      sheet: s.sheet,
      collection: s.collection,
      keys: s.keys,
    })),
    null,
    2
  );

  return `/**
 * ============================================================================
 * One Health & Rabies Surveillance Data Synchronizer
 * ซิงก์ข้อมูลจาก Google Sheets -> Cloud Firestore (upsert)
 * ============================================================================
 * 
 * วิธีติดตั้ง (Installation):
 * 1) Apps Script > Libraries (คลังข้อมูล) > เพิ่ม Library ID:
 *    ${settings.libraryId}   (FirestoreApp)
 * 2) ใส่ค่า Script Properties ใน Project Settings (ฟันเฟือง):
 *    - FB_CLIENT_EMAIL : ${settings.serviceAccountEmail}
 *    - FB_PRIVATE_KEY  : -----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----
 *    - FB_PROJECT_ID   : ${settings.projectId}
 * 3) ตั้งเวลาทำงานอัตโนมัติ (Triggers):
 *    Triggers (รูปนาฬิกา) > Add Trigger > เลือกฟังก์ชัน "syncAllSheets" > Time-driven (เช่น ทุกวัน หรือ ทุกชั่วโมง)
 *
 * หลักการ upsert:
 * - สร้าง Document ID จากค่าคีย์ของแถว (หรือ fallback เป็นเลขแถว row-{i})
 * - ตรวจสอบว่ามีเอกสารเดิมหรือไม่:
 *   - ถ้ามีอยู่แล้ว -> firestore.updateDocument(path, doc) (เขียนทับ/อัปเดต)
 *   - ถ้ายังไม่มี  -> firestore.createDocument(path, doc) (สร้างใหม่)
 */

// ---------- CONFIGURATION ----------
const PROPS = PropertiesService.getScriptProperties();
const SERVICE_ACCOUNT_EMAIL = PROPS.getProperty('FB_CLIENT_EMAIL') || '${settings.serviceAccountEmail}';
const PRIVATE_KEY = (PROPS.getProperty('FB_PRIVATE_KEY') || '${settings.privateKeySnippet}').replace(/\\\\n/g, '\\n');
const PROJECT_ID = PROPS.getProperty('FB_PROJECT_ID') || '${settings.projectId}';

/** ชีตที่จะซิงก์ -> ชื่อ collection + คอลัมน์ที่ใช้เป็นคีย์ (ถ้าเว้นว่างจะใช้เลขแถว) */
const SHEETS = ${sheetsJson};

// ---------- HELPERS ----------
function slug_(v) {
  return String(v == null ? '' : v)
    .trim()
    .replace(/[\\/\\\\\\.\\#\\$\\[\\]]/g, '-')   // กรองอักขระต้องห้ามใน Firestore document id
    .replace(/\\s+/g, '_')
    .slice(0, 80);
}

function docIdFor_(row, keys, rowIndex) {
  if (!keys || !keys.length) return 'row-' + rowIndex;
  const parts = keys.map(function (k) { return slug_(row[k]); }).filter(String);
  return parts.length ? parts.join('__') : 'row-' + rowIndex;
}

function toPlain_(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

// ---------- MAIN SYNC FUNCTION ----------
function syncAllSheets() {
  const firestore = FirestoreApp.getFirestore(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, PROJECT_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let created = 0, updated = 0, failed = 0;
  const syncTimestamp = new Date().toISOString();

  SHEETS.forEach(function (cfg) {
    const sheet = ss.getSheetByName(cfg.sheet);
    if (!sheet) {
      Logger.log('⚠️ ไม่พบชีต: ' + cfg.sheet);
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      Logger.log('ℹ️ ชีต ' + cfg.sheet + ' ไม่มีข้อมูลแถว');
      return;
    }
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const doc = {};
      for (let j = 0; j < headers.length; j++) {
        const h = String(headers[j] || '').trim();
        if (h) doc[h] = toPlain_(row[j]);
      }
      if (!Object.keys(doc).length) continue;

      doc.${settings.autoTimestampField || '_syncedAt'} = syncTimestamp;
      const id = docIdFor_(doc, cfg.keys, i);
      const path = cfg.collection + '/' + id;

      try {
        let exists = true;
        try {
          firestore.getDocument(path);
        } catch (e) {
          exists = false;
        }

        if (exists) {
          firestore.updateDocument(path, doc);   // มีอยู่แล้ว -> อัปเดต
          updated++;
        } else {
          firestore.createDocument(path, doc);   // ข้อมูลใหม่ -> สร้าง
          created++;
        }
      } catch (e) {
        failed++;
        console.error('❌ ข้อผิดพลาดแถว ' + (i + 1) + ' ของชีต ' + cfg.sheet + ' (ID: ' + id + '): ' + e);
      }
    }
  });

  const msg = 'ซิงก์เสร็จสิ้น — สร้างใหม่ ' + created + ' รายการ | อัปเดต ' + updated + ' รายการ | ผิดพลาด ' + failed + ' รายการ';
  Logger.log(msg);
  return msg;
}

/** เรียกจากเมนูใน Google Sheets (มีกล่องแจ้งเตือน UI alert) */
function syncToFirestore() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast('กำลังเริ่มซิงก์ข้อมูลไป Cloud Firestore...', 'One Health Sync', 5);
    const msg = syncAllSheets();
    SpreadsheetApp.getUi().alert('ผลการซิงก์ Firestore', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (err) {
    SpreadsheetApp.getUi().alert('เกิดข้อผิดพลาดในการซิงก์', String(err), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/** ซิงก์เฉพาะชีตปัจจุบันที่กำลังเปิดอยู่ */
function syncCurrentActiveSheet() {
  const firestore = FirestoreApp.getFirestore(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, PROJECT_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getActiveSheet();
  const sheetName = activeSheet.getName();

  const cfg = SHEETS.find(function(c) { return c.sheet === sheetName; });
  if (!cfg) {
    SpreadsheetApp.getUi().alert('ชีตนี้ไม่อยู่ในรายการตั้งค่าซิงก์ (' + sheetName + ')');
    return;
  }

  const data = activeSheet.getDataRange().getValues();
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('ชีตนี้ไม่มีข้อมูล');
    return;
  }

  const headers = data[0];
  let created = 0, updated = 0, failed = 0;
  const syncTimestamp = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const doc = {};
    for (let j = 0; j < headers.length; j++) {
      const h = String(headers[j] || '').trim();
      if (h) doc[h] = toPlain_(row[j]);
    }
    if (!Object.keys(doc).length) continue;

    doc.${settings.autoTimestampField || '_syncedAt'} = syncTimestamp;
    const id = docIdFor_(doc, cfg.keys, i);
    const path = cfg.collection + '/' + id;

    try {
      let exists = true;
      try {
        firestore.getDocument(path);
      } catch (e) {
        exists = false;
      }

      if (exists) {
        firestore.updateDocument(path, doc);
        updated++;
      } else {
        firestore.createDocument(path, doc);
        created++;
      }
    } catch (e) {
      failed++;
    }
  }

  SpreadsheetApp.getUi().alert('ซิงก์ชีต ' + sheetName + ' สำเร็จ!\\nสร้างใหม่: ' + created + ' | อัปเดต: ' + updated + ' | ผิดพลาด: ' + failed);
}

/** สร้างเมนูเมื่อเปิด Spreadsheet */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔥 Firebase Firestore')
    .addItem('🚀 ซิงก์ทุกชีต (Sync All Sheets)', 'syncToFirestore')
    .addItem('📄 ซิงก์เฉพาะชีตปัจจุบัน (Sync Active Sheet)', 'syncCurrentActiveSheet')
    .addSeparator()
    .addItem('ℹ️ ตรวจสอบการเชื่อมต่อ (Test Connection)', 'testFirestoreConnection')
    .addToUi();
}

/** ฟังก์ชันทดสอบการเชื่อมต่อ Service Account */
function testFirestoreConnection() {
  try {
    const firestore = FirestoreApp.getFirestore(SERVICE_ACCOUNT_EMAIL, PRIVATE_KEY, PROJECT_ID);
    const testDoc = { status: 'ok', testedAt: new Date().toISOString() };
    firestore.createDocument('_system_health/ping', testDoc);
    SpreadsheetApp.getUi().alert('เชื่อมต่อ Firestore สำเร็จ! (Project: ' + PROJECT_ID + ')');
  } catch (err) {
    SpreadsheetApp.getUi().alert('เชื่อมต่อไม่สำเร็จ: ' + String(err));
  }
}
`;
}
