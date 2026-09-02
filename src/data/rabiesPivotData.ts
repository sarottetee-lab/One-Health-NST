export interface DistrictYearStat {
  district: string;
  year: number;
  yearBE: number;
  negative: number;
  positive: number;
  inconclusive: number;
  total: number;
}

/**
 * Raw ground truth pivot matrix provided from Nakhon Si Thammarat Rabies Surveillance (2012 - 2026 / พ.ศ. 2555 - 2569)
 * Total Samples: 2,165 records (167 confirmed positives, 1,997 negatives, 1 inconclusive)
 */
export const RAW_RABIES_PIVOT_DATA: {
  district: string;
  records: { [year: number]: { negative: number; positive: number; inconclusive: number } };
}[] = [
  {
    "district": "ขนอม",
    "records": {
      "2015": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2019": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "จุฬาภรณ์",
    "records": {
      "2016": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 2,
        "positive": 4,
        "inconclusive": 0
      },
      "2019": {
        "negative": 29,
        "positive": 4,
        "inconclusive": 0
      },
      "2020": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 2,
        "positive": 1,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 1,
        "inconclusive": 0
      },
      "2024": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 4,
        "positive": 3,
        "inconclusive": 0
      },
      "2026": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ฉวาง",
    "records": {
      "2014": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 14,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2019": {
        "negative": 11,
        "positive": 2,
        "inconclusive": 0
      },
      "2020": {
        "negative": 11,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 28,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 27,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "เฉลิมพระเกียรติ",
    "records": {
      "2014": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 6,
        "positive": 1,
        "inconclusive": 0
      },
      "2017": {
        "negative": 1,
        "positive": 1,
        "inconclusive": 0
      },
      "2018": {
        "negative": 5,
        "positive": 5,
        "inconclusive": 0
      },
      "2019": {
        "negative": 33,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 0,
        "positive": 1,
        "inconclusive": 0
      },
      "2024": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ชะอวด",
    "records": {
      "2015": {
        "negative": 2,
        "positive": 1,
        "inconclusive": 0
      },
      "2016": {
        "negative": 15,
        "positive": 3,
        "inconclusive": 0
      },
      "2017": {
        "negative": 1,
        "positive": 8,
        "inconclusive": 0
      },
      "2018": {
        "negative": 2,
        "positive": 8,
        "inconclusive": 0
      },
      "2019": {
        "negative": 15,
        "positive": 2,
        "inconclusive": 0
      },
      "2020": {
        "negative": 5,
        "positive": 3,
        "inconclusive": 0
      },
      "2021": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 5,
        "positive": 1,
        "inconclusive": 0
      },
      "2024": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 11,
        "positive": 2,
        "inconclusive": 0
      },
      "2026": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ช้างกลาง",
    "records": {
      "2014": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 4,
        "positive": 4,
        "inconclusive": 0
      },
      "2019": {
        "negative": 5,
        "positive": 3,
        "inconclusive": 0
      },
      "2020": {
        "negative": 2,
        "positive": 1,
        "inconclusive": 0
      },
      "2021": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "เชียรใหญ่",
    "records": {
      "2015": {
        "negative": 8,
        "positive": 1,
        "inconclusive": 0
      },
      "2016": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 5,
        "positive": 2,
        "inconclusive": 0
      },
      "2019": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 2,
        "positive": 1,
        "inconclusive": 0
      },
      "2021": {
        "negative": 10,
        "positive": 1,
        "inconclusive": 0
      },
      "2022": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 3,
        "inconclusive": 0
      },
      "2024": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 11,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ถ้ำพรรณรา",
    "records": {
      "2014": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2019": {
        "negative": 7,
        "positive": 1,
        "inconclusive": 0
      },
      "2020": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ท่าศาลา",
    "records": {
      "2015": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 19,
        "positive": 0,
        "inconclusive": 0
      },
      "2019": {
        "negative": 16,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 14,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 23,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 16,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ทุ่งสง",
    "records": {
      "2013": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2014": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 20,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 11,
        "positive": 0,
        "inconclusive": 1
      },
      "2017": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 6,
        "positive": 4,
        "inconclusive": 0
      },
      "2019": {
        "negative": 41,
        "positive": 3,
        "inconclusive": 0
      },
      "2020": {
        "negative": 19,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 14,
        "positive": 1,
        "inconclusive": 0
      },
      "2022": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 24,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 25,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ทุ่งใหญ่",
    "records": {
      "2015": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 3,
        "positive": 4,
        "inconclusive": 0
      },
      "2019": {
        "negative": 23,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "นบพิตำ",
    "records": {
      "2014": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 1,
        "positive": 1,
        "inconclusive": 0
      },
      "2019": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "นาบอน",
    "records": {
      "2015": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 0,
        "positive": 2,
        "inconclusive": 0
      },
      "2019": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 5,
        "positive": 2,
        "inconclusive": 0
      },
      "2021": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "บางขัน",
    "records": {
      "2015": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 3,
        "positive": 1,
        "inconclusive": 0
      },
      "2017": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 0,
        "positive": 2,
        "inconclusive": 0
      },
      "2019": {
        "negative": 6,
        "positive": 2,
        "inconclusive": 0
      },
      "2020": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ปากพนัง",
    "records": {
      "2014": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 16,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 16,
        "positive": 1,
        "inconclusive": 0
      },
      "2018": {
        "negative": 23,
        "positive": 3,
        "inconclusive": 0
      },
      "2019": {
        "negative": 2,
        "positive": 2,
        "inconclusive": 0
      },
      "2020": {
        "negative": 23,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 16,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 18,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 17,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "พรหมคีรี",
    "records": {
      "2014": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 11,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 7,
        "positive": 1,
        "inconclusive": 0
      },
      "2019": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "พระพรหม",
    "records": {
      "2014": {
        "negative": 0,
        "positive": 1,
        "inconclusive": 0
      },
      "2015": {
        "negative": 5,
        "positive": 2,
        "inconclusive": 0
      },
      "2016": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 1,
        "positive": 1,
        "inconclusive": 0
      },
      "2018": {
        "negative": 1,
        "positive": 1,
        "inconclusive": 0
      },
      "2019": {
        "negative": 4,
        "positive": 1,
        "inconclusive": 0
      },
      "2020": {
        "negative": 2,
        "positive": 1,
        "inconclusive": 0
      },
      "2021": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 3,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 2,
        "positive": 1,
        "inconclusive": 0
      },
      "2024": {
        "negative": 1,
        "positive": 1,
        "inconclusive": 0
      },
      "2025": {
        "negative": 4,
        "positive": 1,
        "inconclusive": 0
      },
      "2026": {
        "negative": 1,
        "positive": 2,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "พิปูน",
    "records": {
      "2016": {
        "negative": 4,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 4,
        "positive": 2,
        "inconclusive": 0
      },
      "2019": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 3,
        "positive": 1,
        "inconclusive": 0
      },
      "2021": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 6,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "เมืองนครศรีธรรมราช",
    "records": {
      "2014": {
        "negative": 11,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 14,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 27,
        "positive": 5,
        "inconclusive": 0
      },
      "2019": {
        "negative": 31,
        "positive": 1,
        "inconclusive": 0
      },
      "2020": {
        "negative": 28,
        "positive": 6,
        "inconclusive": 0
      },
      "2021": {
        "negative": 42,
        "positive": 2,
        "inconclusive": 0
      },
      "2022": {
        "negative": 16,
        "positive": 1,
        "inconclusive": 0
      },
      "2023": {
        "negative": 23,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 24,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 24,
        "positive": 1,
        "inconclusive": 0
      },
      "2026": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ร่อนพิบูลย์",
    "records": {
      "2014": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 11,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 4,
        "positive": 2,
        "inconclusive": 0
      },
      "2019": {
        "negative": 5,
        "positive": 10,
        "inconclusive": 0
      },
      "2020": {
        "negative": 6,
        "positive": 1,
        "inconclusive": 0
      },
      "2021": {
        "negative": 7,
        "positive": 2,
        "inconclusive": 0
      },
      "2022": {
        "negative": 5,
        "positive": 2,
        "inconclusive": 0
      },
      "2023": {
        "negative": 3,
        "positive": 2,
        "inconclusive": 0
      },
      "2024": {
        "negative": 8,
        "positive": 2,
        "inconclusive": 0
      },
      "2025": {
        "negative": 8,
        "positive": 2,
        "inconclusive": 0
      },
      "2026": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "ลานสกา",
    "records": {
      "2016": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 0,
        "positive": 1,
        "inconclusive": 0
      },
      "2018": {
        "negative": 7,
        "positive": 1,
        "inconclusive": 0
      },
      "2019": {
        "negative": 3,
        "positive": 1,
        "inconclusive": 0
      },
      "2021": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 7,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "สิชล",
    "records": {
      "2014": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2015": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      },
      "2016": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2017": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2018": {
        "negative": 13,
        "positive": 0,
        "inconclusive": 0
      },
      "2019": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2020": {
        "negative": 14,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 8,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 1,
        "positive": 0,
        "inconclusive": 0
      },
      "2024": {
        "negative": 5,
        "positive": 0,
        "inconclusive": 0
      },
      "2025": {
        "negative": 9,
        "positive": 0,
        "inconclusive": 0
      },
      "2026": {
        "negative": 14,
        "positive": 0,
        "inconclusive": 0
      }
    }
  },
  {
    "district": "หัวไทร",
    "records": {
      "2014": {
        "negative": 0,
        "positive": 2,
        "inconclusive": 0
      },
      "2015": {
        "negative": 37,
        "positive": 3,
        "inconclusive": 0
      },
      "2016": {
        "negative": 7,
        "positive": 4,
        "inconclusive": 0
      },
      "2017": {
        "negative": 11,
        "positive": 2,
        "inconclusive": 0
      },
      "2018": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      },
      "2019": {
        "negative": 4,
        "positive": 1,
        "inconclusive": 0
      },
      "2020": {
        "negative": 2,
        "positive": 0,
        "inconclusive": 0
      },
      "2021": {
        "negative": 13,
        "positive": 0,
        "inconclusive": 0
      },
      "2022": {
        "negative": 10,
        "positive": 0,
        "inconclusive": 0
      },
      "2023": {
        "negative": 1,
        "positive": 1,
        "inconclusive": 0
      },
      "2025": {
        "negative": 12,
        "positive": 0,
        "inconclusive": 0
      }
    }
  }
];

/**
 * Get flattened list of district-year statistics
 */
export function getRabiesPivotFlatList(): DistrictYearStat[] {
  const result: DistrictYearStat[] = [];
  RAW_RABIES_PIVOT_DATA.forEach((d) => {
    Object.entries(d.records).forEach(([yearStr, rec]) => {
      const year = parseInt(yearStr, 10);
      result.push({
        district: d.district,
        year,
        yearBE: year + 543,
        negative: rec.negative,
        positive: rec.positive,
        inconclusive: rec.inconclusive,
        total: rec.negative + rec.positive + rec.inconclusive,
      });
    });
  });
  return result;
}

export const PIVOT_AVAILABLE_YEARS_AD = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
export const PIVOT_AVAILABLE_YEARS_BE = PIVOT_AVAILABLE_YEARS_AD.map((y) => y + 543);
