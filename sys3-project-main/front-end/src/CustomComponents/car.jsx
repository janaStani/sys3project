import { useState, useMemo } from "react";

export const CAR_MODELS = [
  {
    id: 1, make: "BMW", model: "X5", type: "SUV",
    description: "BMW's mid-size SUV blend of luxury, off-road capability and sharp handling.",
    years: [
      {
        generation: "E53", yearStart: 1999, yearEnd: 2006,
        power: "184 – 360 hp", price: "€45,000 – €75,000",
        fuelType: "Petrol, Diesel",
        engine: ["3.0L inline-6", "4.4L V8", "4.6L V8", "4.8L V8"],
        drivetrain: "xDrive",
        consumption: "12 – 16L",
        image: "https://bidders-highway.fra1.cdn.digitaloceanspaces.com/c0aa640fa20fcb935bcd41c1242e2174"
      },
      {
        generation: "E70", yearStart: 2007, yearEnd: 2013,
        power: "235 – 407 hp", price: "€55,000 – €85,000",
        fuelType: "Petrol, Diesel",
        engine: ["3.0L inline-6", "3.0L twin-turbo diesel", "4.8L V8 petrol"],
        drivetrain: "xDrive",
        consumption: "8 – 13L",
        image: "https://images.ctfassets.net/c9t6u0qhbv9e/20062013BMWX5GenerationalReviewsummary/07d5cdcd832fbead31cfbacef43ef14e/2006-2013_BMW_X5_Generational_Review_summaryImage.jpeg"
      },
      {
        generation: "F15", yearStart: 2014, yearEnd: 2018,
        power: "218 – 450 hp", price: "€60,000 – €95,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0L turbo inline-4", "3.0L inline-6 turbo", "4.4L V8 twin turbo", "xDrive40e plug-in hybrid"],
        drivetrain: "xDrive / RWD",
        consumption: "6 – 12L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/BMW-X5--F15--4873_17.jpg"
      },
      {
        generation: "G05", yearStart: 2019, yearEnd: 2022,
        power: "231 – 530 hp", price: "€65,000 – €120,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0L turbo inline-4", "3.0L inline-6 turbo", "4.4L V8 twin turbo (M50i)", "xDrive45e plug-in hybrid"],
        drivetrain: "xDrive",
        consumption: "7 – 12L \n 2 – 3L hybrid",
        image: "https://s1.cdn.autoevolution.com/images/gallery/BMW-X5-6367_26.jpg"
        
      },
      {
        generation: "G05 facelift", yearStart: 2023, yearEnd: null,
        power: "298 – 530 hp", price: "€75,000 – €130,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["3.0L inline-6 mild hybrid", "4.4L V8 (M60i)", "xDrive50e plug-in hybrid"],
        drivetrain: "xDrive",
        consumption: "7 – 11L \n 2 – 3L hybrid",
        image: "https://s1.cdn.autoevolution.com/images/gallery/bmw-x5-2023-7413_48.jpg"
      }
    ]
  },
  {
    id: 2, make: "BMW", model: "M3", type: "Sedan",
    description: "The benchmark sports sedan, track-ready performance with everyday usability.",
    years: [
      {
        generation: "E30", yearStart: 1986, yearEnd: 1991,
        power: "195 – 238 hp", price: "€25,000 – €45,000",
        fuelType: "Petrol",
        engine: ["2.3L inline-4", "2.5L inline-4"],
        drivetrain: "RWD",
        consumption: "10 – 13L",
        image: "https://hips.hearstapps.com/hmg-prod/images/bmw-m-party-web-2-1633454516.jpg"
      },
      {
        generation: "E36", yearStart: 1992, yearEnd: 1999,
        power: "286 – 321 hp", price: "€40,000 – €60,000",
        fuelType: "Petrol",
        engine: ["3.0L inline-6", "3.2L inline-6"],
        drivetrain: "RWD",
        consumption: "10 – 12L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/BMW-M3-Sedan--E36--771_10.jpeg"
      },
      {
        generation: "E46", yearStart: 2000, yearEnd: 2006,
        power: "338 hp", price: "€50,000 – €65,000",
        fuelType: "Petrol",
        engine: ["3.2L inline-6"],
        drivetrain: "RWD",
        consumption: "10 – 12L",
        image: "https://www.bmw-m.com/content/dam/bmw/marketBMW_M/www_bmw-m_com/topics/magazine-article-pool/2018/bmw-m3-e46/bmw-m3-e46-portraet-01-st-16x9.jpg"
      },
      {
        generation: "E90/E92/E93", yearStart: 2007, yearEnd: 2013,
        power: "414 – 420 hp", price: "€58,000 – €80,000",
        fuelType: "Petrol",
        engine: ["4.0L V8 "],
        drivetrain: "RWD",
        consumption: "12 – 14L",
        image: "https://images.squarespace-cdn.com/content/v1/5caed8960cf57d49530e8c60/97cd9bbb-ee97-41f0-808a-8aa556f48e01/art-mg-bmwe92m3+a06.jpg"
      },
      {
        generation: "F80", yearStart: 2014, yearEnd: 2018,
        power: "425 – 444 hp", price: "€65,000 – €85,000",
        fuelType: "Petrol",
        engine: ["3.0L twin-turbo inline-6"],
        drivetrain: "RWD",
        consumption: "9 – 11L",
        image: "https://www.bmw-m.com/content/dam/bmw/marketBMW_M/www_bmw-m_com/topics/magazine-article-pool/2025/bmw-m3-cs-f80/bmw-m3-cs-f80-01-16x9-st-neu.jpg"
      },
      {
        generation: "G80", yearStart: 2021, yearEnd: null,
        power: "480 – 530 hp", price: "€78,000 – €105,000",
        fuelType: "Petrol",
        engine: ["3.0L twin-turbo inline-6"],
        drivetrain: "RWD / xDrive",
        consumption: "10 – 12L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/bmw-m3-sedan-2024-7752_16.jpg"
      }
    ]
  },
  {
    id: 3, make: "BMW", model: "i4", type: "Electric",
    description: "BMW's electric Gran Coupé, pairing combustion-era driving dynamics with a zero-emission drivetrain.",
    years: [
      {
        generation: "G26", yearStart: 2022, yearEnd: null,
        power: "340 – 544 hp", price: "€58,000 – €80,000",
        fuelType: "Electric",
        engine: ["Single rear motor (eDrive40)", "Dual motor (M50)"],
        drivetrain: "RWD / AWD",
        consumption: "16 – 18 kWh range 480 – 590 km",
        image: "https://s1.cdn.autoevolution.com/images/gallery/bmw-i4-2024-7734_37.jpg"
      }
    ]
  },
  {
    id: 4, make: "Audi", model: "A4", type: "Sedan",
    description: "Compact executive sedan known for understated styling and a refined cabin.",
    years: [
      {
        generation: "B5", yearStart: 1994, yearEnd: 2001,
        power: "100 – 265 hp", price: "€25,000 – €45,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.6L inline-4", "1.8T inline-4", "2.6L V6", "2.8L V6"],
        drivetrain: "FWD / quattro AWD",
        consumption: "7 – 12L",
        image: "https://hips.hearstapps.com/hmg-prod/images/1996-audi-a4-107-65bd1a839cadc.jpg?crop=0.8888888888888888xw:1xh;center,top&resize=1200:*"
      },
      {
        generation: "B6", yearStart: 2001, yearEnd: 2004,
        power: "102 – 256 hp", price: "€28,000 – €48,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.8T inline-4", "2.0L inline-4", "3.0L V6"],
        drivetrain: "FWD / quattro AWD",
        consumption: "7 – 11L",
        image: "https://www.thedrive.com/wp-content/uploads/2022/09/13/audi_a4_2000_pictures_11.jpg"
      },
      {
        generation: "B7", yearStart: 2004, yearEnd: 2008,
        power: "102 – 344 hp", price: "€30,000 – €55,000 (new)",
        fuelType: "Petrol, Diesel",
        engine: ["2.0T inline-4", "3.2L V6", "4.2L V8 (RS4)"],
        drivetrain: "FWD / quattro AWD",
        consumption: "7 – 12 L",
        image: "https://assets.adac.de/image/upload/v1/Autodatenbank/Fahrzeugbilder/im01049-1-audi-a4.jpg"
      },
      {
        generation: "B8", yearStart: 2008, yearEnd: 2015,
        power: "120 – 333 hp", price: "€33,000 – €58,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.8T inline-4", "2.0T inline-4", "2.0L TDI", "3.0L V6"],
        drivetrain: "FWD / quattro AWD",
        consumption: "6 – 10 L",
        image: "https://static0.carbuzzimages.com/wordpress/wp-content/uploads/2024/04/4th-gen-audi-a4-front-view-1.jpeg?q=70&fit=crop&w=825&dpr=1"
      },
      {
        generation: "B9", yearStart: 2015, yearEnd: 2019,
        power: "150 – 285 hp", price: "€36,000 – €60,000",
        fuelType: "Petrol, Diesel, Mild Hybrid",
        engine: ["1.4T inline-4", "2.0T inline-4", "2.0L TDI", "3.0L TDI V6"],
        drivetrain: "FWD / quattro AWD",
        consumption: "5 – 9L",
        image: "https://assets.autobuzz.my/wp-content/uploads/2018/06/28120235/2018-Audi-A4-Sedan-Refreshed-6.jpg"
      },
      {
        generation: "B9 facelift", yearStart: 2019, yearEnd: null,
        power: "150 – 265 hp", price: "€40,000 – €65,000",
        fuelType: "Petrol, Diesel, Mild Hybrid",
        engine: ["2.0T inline-4 MHEV", "2.0L TDI MHEV", "45 TFSI quattro"],
        drivetrain: "FWD / quattro AWD",
        consumption: "5 – 8L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/AUDI-A4-6631_15.jpg"
      }
    ]
  },
  {
    id: 5, make: "Audi", model: "Q5", type: "SUV",
    description: "Compact luxury SUV balancing comfort, tech and all-weather capability.",
    years: [
      {
        generation: "8R (1st gen)", yearStart: 2008, yearEnd: 2017,
        power: "170 – 354 hp", price: "€38,000 – €65,000",
        fuelType: "Petrol, Diesel",
        engine: ["2.0T inline-4", "3.0L V6", "2.0L TDI", "3.0L TDI"],
        drivetrain: "quattro AWD",
        consumption: "7 – 11L",
        image: "https://cdn3.focus.bg/autodata/i/audi/q5/q5-8r-restyling/large/55c40abf27d45d24df3f34064b1218af.jpg"
      },
      {
        generation: "FY (2nd gen)", yearStart: 2017, yearEnd: 2020,
        power: "163 – 354 hp", price: "€44,000 – €72,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0T inline-4", "3.0L V6", "2.0L TDI", "55 TFSI e PHEV"],
        drivetrain: "quattro AWD",
        consumption: "6 – 10L",
        image: "https://www.cataloge.eu/media/audi/47/en/audi-q5-2016-fy-80a.jpg"
      },
      {
        generation: "FY facelift", yearStart: 2020, yearEnd: null,
        power: "204 – 299 hp", price: "€50,000 – €78,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0T MHEV", "2.0L TDI MHEV", "55 TFSI e plug-in hybrid"],
        drivetrain: "quattro AWD",
        consumption: "6 – 9L \n 2–3L ",
        image:"https://s1.cdn.autoevolution.com/images/gallery/audi-q5-2024-7798_18.jpg"
      }
    ]
  },
  {
    id: 6, make: "Audi", model: "R8", type: "Coupe",
    description: "Audi's halo supercar, naturally aspirated V10 in an everyday-usable package.",
    years: [
      {
        generation: "42", yearStart: 2007, yearEnd: 2015,
        power: "420 – 560 hp", price: "€110,000 – €165,000",
        fuelType: "Petrol",
        engine: ["4.2L V8", "5.2L V10"],
        drivetrain: "AWD quattro",
        consumption: "12 – 16L",
        image: "https://images.squarespace-cdn.com/content/v1/5caed8960cf57d49530e8c60/1630567660786-FH8AVCPX83MT78OY112B/art-mg-audir8b.jpg"
      },
      {
        generation: "4S", yearStart: 2015, yearEnd: 2023,
        power: "540 – 620 hp", price: "€150,000 – €210,000",
        fuelType: "Petrol",
        engine: ["5.2L naturally aspirated V10", "5.2L V10 Performance"],
        drivetrain: "AWD quattro",
        consumption: "13 – 15L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/audi-r8-v10-performance-rwd-2021-7218_11.jpg"
      }
    ]
  },
  {
    id: 7, make: "Mercedes", model: "C-Class", type: "Sedan",
    description: "Mercedes' compact executive sedan, offering S-Class tech in a smaller footprint.",
    years: [
      {
        generation: "W202", yearStart: 1993, yearEnd: 2000,
        power: "111 – 347 hp", price: "€28,000 – €55,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.8L inline-4", "2.0L inline-4", "2.3L inline-4", "2.8L V6"],
        drivetrain: "RWD",
        consumption: "8 – 13L",
        image: "https://prestigeandperformancecar.com/wp-content/uploads/A93F1675-1240x775.jpg"
      },
      {
        generation: "W203", yearStart: 2000, yearEnd: 2007,
        power: "120 – 476 hp", price: "€30,000 – €70,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.8L Kompressor", "2.6L V6", "3.2L V8 (AMG)", "2.2L CDI"],
        drivetrain: "RWD",
        consumption: "7 – 13L",
        image: "https://static0.hotcarsimages.com/wordpress/wp-content/uploads/2023/04/mercedes-c-class-w203-featured.jpg"
      },
      {
        generation: "W204", yearStart: 2007, yearEnd: 2014,
        power: "136 – 457 hp", price: "€34,000 – €75,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.8L Kompressor", "3.0L V6", "6.2L V8 AMG", "2.1L CDI"],
        drivetrain: "RWD / 4MATIC AWD",
        consumption: "6 – 14L",
        image: "https://cdn.caranddriving.com/f2/images/used/large/Mercedes/MercedesCClass0311(2).jpg"
      },
      {
        generation: "W205", yearStart: 2014, yearEnd: 2021,
        power: "156 – 510 hp", price: "€38,000 – €95,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0L inline-4 turbo", "3.0L V6 biturbo", "4.0L V8 biturbo AMG", "2.0L diesel"],
        drivetrain: "RWD / 4MATIC AWD",
        consumption: "6 – 12L",
        image: "https://images.cdn.autocar.co.uk/sites/autocar.co.uk/files/images/car-reviews/first-drives/legacy/c-class_rt_2014u.jpg"
      },
      {
        generation: "W206", yearStart: 2021, yearEnd: null,
        power: "170 – 476 hp", price: "€46,000 – €110,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0L inline-4 MHEV", "3.0L inline-6 EQ Boost", "4.0L V8 AMG"],
        drivetrain: "RWD / 4MATIC AWD",
        consumption: "6 – 11L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/mercedes-benz-c-class-2021-7029_74.jpg"
      }
    ]
  },
  {
    id: 8, make: "Mercedes", model: "G-Class", type: "SUV",
    description: "An icon of go-anywhere luxury, boxy styling, serious off-road hardware.",
    years: [
      {
        generation: "W460", yearStart: 1979, yearEnd: 1991,
        power: "72 – 168 hp", price: "€30,000 – €55,000",
        fuelType: "Petrol, Diesel",
        engine: ["2.3L inline-4 petrol", "2.4L diesel", "3.0L diesel"],
        drivetrain: "Part-time AWD with 3 diff locks",
        consumption: "13 – 18L",
        image: "https://500sec.com/wp-content/uploads/2012/10/99286206c521_02.jpg"
      },
      {
        generation: "W461/W463", yearStart: 1990, yearEnd: 2018,
        power: "156 – 612 hp", price: "€65,000 – €200,000",
        fuelType: "Petrol, Diesel",
        engine: ["2.7L CDI diesel", "3.0L CDI V6", "5.5L V8", "6.0L V12 (AMG)"],
        drivetrain: "Permanent AWD with 3 diff locks",
        consumption: "11 – 18L",
        image: "https://www.exoticcarhacks.com/wp-content/uploads/2024/04/4A4PWH9y-scaled.jpeg"
      },
      {
        generation: "W463", yearStart: 2018, yearEnd: null,
        power: "286 – 585 hp", price: "€110,000 – €250,000",
        fuelType: "Petrol",
        engine: ["3.0L inline-6 mild hybrid (G 450)", "4.0L twin-turbo V8 (G 500 / AMG G63)"],
        drivetrain: "Permanent AWD (4MATIC) with 3 diff locks",
        consumption: "12 – 16L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/mercedes-benz-g-class-2024-7707_40.jpg"
      }
    ]
  },
  {
    id: 9, make: "Mercedes", model: "S-Class", type: "Sedan",
    description: "Mercedes' flagship luxury sedan, setting the benchmark for comfort and in-car technology.",
    years: [
      {
        generation: "W126", yearStart: 1979, yearEnd: 1991,
        power: "185 – 326 hp", price: "€45,000 – €90,000",
        fuelType: "Petrol, Diesel",
        engine: ["2.8L inline-6", "3.8L V8", "5.0L V8", "3.0L diesel"],
        drivetrain: "Rear-wheel drive",
        consumption: "11 – 16L",
        image: "https://car-images.bauersecure.com/wp-images/206362/s-class-retro-twin-test5.jpg"
      },
      {
        generation: "W140", yearStart: 1991, yearEnd: 1998,
        power: "231 – 394 hp", price: "€80,000 – €140,000",
        fuelType: "Petrol, Diesel",
        engine: ["3.2L inline-6", "4.2L V8", "5.0L V8", "6.0L V12"],
        drivetrain: "Rear-wheel drive",
        consumption: "12 – 18L",
        image: "https://mercedesblog.com/wp-content/uploads/2016/02/Mercedes-S-Class-W140-4.jpg"
      },
      {
        generation: "W220", yearStart: 1998, yearEnd: 2005,
        power: "224 – 612 hp", price: "€75,000 – €160,000",
        fuelType: "Petrol, Diesel",
        engine: ["3.2L V6", "5.0L V8", "5.5L V8", "6.0L V12", "3.2L CDI V6"],
        drivetrain: "Rear-wheel drive / 4MATIC AWD",
        consumption: "11 – 16L",
        image: "https://hips.hearstapps.com/hmg-prod/images/mercedes-s-class106-1598964789.jpg"
      },
      {
        generation: "W221", yearStart: 2005, yearEnd: 2013,
        power: "235 – 612 hp", price: "€80,000 – €180,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["3.5L V6", "4.7L V8", "5.5L V8", "S 400 Hybrid"],
        drivetrain: "Rear-wheel drive / 4MATIC AWD",
        consumption: "10 – 15L",
        image: "https://images.cdn.autocar.co.uk/sites/autocar.co.uk/files/styles/gallery_slide/public/mercedes-benz-s-class.jpg?itok=SgyEQ0sT"
      },
      {
        generation: "W222", yearStart: 2013, yearEnd: 2020,
        power: "258 – 630 hp", price: "€90,000 – €220,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["3.0L V6 diesel", "4.7L V8 biturbo", "6.0L V12 (S 65 AMG)"],
        drivetrain: "Rear-wheel drive / 4MATIC AWD",
        consumption: "8 – 14L",
        image: "https://media.evo.co.uk/image/private/s--X-WVjvBW--/f_auto,t_content-image-full-desktop@1/v1556217115/evo/2017/07/17c525_005.jpg"
      },
      {
        generation: "W223", yearStart: 2020, yearEnd: null,
        power: "286 – 630 hp", price: "€105,000 – €250,000+",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["3.0L inline-6 MHEV", "4.0L V8 biturbo", "S 580 e PHEV"],
        drivetrain: "Rear-wheel drive / 4MATIC AWD",
        consumption: "8–12L \n 2–3L PHEV",
        image: "https://s1.cdn.autoevolution.com/images/gallery/mercedes-benz-s-class-2026-8011_32.jpg"
      }
    ]
  },
  {
    id: 10, make: "Volkswagen", model: "Golf GTI", type: "Hatchback",
    description: "The original hot hatch, practical daily driver with genuine performance credentials.",
    years: [
      {
        generation: "Mk1", yearStart: 1976, yearEnd: 1983,
        power: "110 hp", price: "€8,000 – €14,000",
        fuelType: "Petrol",
        engine: ["1.6L inline-4 fuel injected"],
        drivetrain: "Front-wheel drive",
        consumption: "9 – 11L",
        image: "https://static.wikia.nocookie.net/nfs/images/4/4d/NFSUB_Garage_Volkswagen_GolfGTi1974.jpg/revision/latest?cb=20230218183345&path-prefix=en"
      },
      {
        generation: "Mk2", yearStart: 1984, yearEnd: 1992,
        power: "112 – 160 hp", price: "€13,000 – €22,000",
        fuelType: "Petrol",
        engine: ["1.8L inline-4", "1.8L 16V inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "9 – 11L",
        image: "https://www.classicdriver.com/sites/default/files/article_images/1ec9ec4c14295909a3f86202f8765e38.jpg"
      },
      {
        generation: "Mk3", yearStart: 1992, yearEnd: 1997,
        power: "115 hp", price: "€17,000 – €24,000",
        fuelType: "Petrol",
        engine: ["2.0L inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "8 – 10L",
        image: "https://www.carthrottle.com/sites/default/files/uploads/2024-08/1_GolfGTI50_087.jpg?width=1600"
      },
      {
        generation: "Mk4", yearStart: 1997, yearEnd: 2004,
        power: "150 hp", price: "€20,000 – €28,000",
        fuelType: "Petrol",
        engine: ["1.8T inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "8 – 10L",
        image: "https://eu-west-2-vertu.graphassets.com/cm92it54301f707ns4y4t66eo/output=format:jpg/resize=width:4096,height:2725/cmjr818g301ma07mn9aemx1bj"
      },
      {
        generation: "Mk5", yearStart: 2004, yearEnd: 2009,
        power: "200 hp", price: "€25,000 – €33,000",
        fuelType: "Petrol",
        engine: ["2.0T FSI inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "8 – 10L",
        image: "https://eu-west-2-vertu.graphassets.com/cm92it54301f707ns4y4t66eo/output=format:jpg/resize=width:4096,height:2725/cmjr80hx501kz07mnyowh428p"
      },
      {
        generation: "Mk6", yearStart: 2009, yearEnd: 2013,
        power: "210 hp", price: "€27,000 – €35,000",
        fuelType: "Petrol",
        engine: ["2.0T TSI inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "7 – 9L",
        image: "https://car-images.bauersecure.com/wp-images/13585/000199896072-17f5-40d5-b.jpg"
      },
      {
        generation: "Mk7", yearStart: 2013, yearEnd: 2020,
        power: "220 – 230 hp", price: "€29,000 – €38,000",
        fuelType: "Petrol",
        engine: ["2.0T TSI inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "7 – 9L",
        image: "https://www.vwpress.co.uk/assets/images/thumbnail/41765-golf-gti-mk-vii-001.jpg"
      },
      {
        generation: "Mk8", yearStart: 2021, yearEnd: null,
        power: "245 – 300 hp", price: "€33,000 – €45,000",
        fuelType: "Petrol",
        engine: ["2.0T TSI inline-4", "2.0T TSI (Clubsport)"],
        drivetrain: "Front-wheel drive",
        consumption: "7 – 8L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/volkswagen-golf-gti-edition-50-2025-7931_52.jpg"
      }
    ]
  },
  {
    id: 11, make: "Volkswagen", model: "Tiguan", type: "SUV",
    description: "A practical compact SUV built for families, with a spacious and well-equipped cabin.",
    years: [
      {
        generation: "Mk1 (5N)", yearStart: 2007, yearEnd: 2016,
        power: "110 – 200 hp", price: "€24,000 – €38,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.4T TSI", "2.0T TSI", "2.0L TDI"],
        drivetrain: "Front-wheel drive / 4MOTION AWD",
        consumption: "7 – 11L",
        image: "https://images.squarespace-cdn.com/content/v1/55d74953e4b054689caf6e9c/1494928864592-CA5IO96O2FF21E1DKWZS/VW-Tiguan-Mk1-08.jpg"
      },
      {
        generation: "Mk2 (AD1)", yearStart: 2016, yearEnd: 2023,
        power: "130 – 320 hp", price: "€30,000 – €55,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["1.4T TSI", "2.0T TSI", "2.0L TDI", "1.4 TSI eHybrid PHEV"],
        drivetrain: "Front-wheel drive / 4MOTION AWD",
        consumption: "6 – 10L \n ~2L PHEV",
        image: "https://cdn.caranddriving.com/f2/images/used/large/Volkswagen/VolkswagenTiguan2016to2020.jpg"
      },
      {
        generation: "Mk3 (BW2)", yearStart: 2023, yearEnd: null,
        power: "150 – 265 hp", price: "€34,000 – €58,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["1.5T eTSI MHEV", "2.0T TSI", "2.0L TDI", "eHybrid PHEV"],
        drivetrain: "Front-wheel drive / 4MOTION AWD",
        consumption: "6 – 9L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/volkswagen-tiguan-2021-1-7165_11.jpg"
      }
    ]
  },
  {
    id: 12, make: "Toyota", model: "Corolla", type: "Sedan",
    description: "One of the world's best-selling sedans, efficient, reliable and cheap to run.",
    years: [
      {
        generation: "E110", yearStart: 1995, yearEnd: 2002,
        power: "85 – 114 hp", price: "€14,000 – €21,000",
        fuelType: "Petrol",
        engine: ["1.3L inline-4", "1.6L inline-4", "1.8L inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "7 – 9L",
        image: "https://i.auto-bild.de/ir_img/3/8/2/6/8/1/9/Toyota-Corolla-3797-474x267-4c31f1fbaa4abed6.jpg?impolicy=leadteaser"
      },
      {
        generation: "E120", yearStart: 2000, yearEnd: 2006,
        power: "87 – 140 hp", price: "€16,000 – €24,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.4L inline-4", "1.6L inline-4", "1.8L inline-4", "2.0L D-4D diesel"],
        drivetrain: "Front-wheel drive",
        consumption: "6 – 9L",
        image: "https://cdn.matador.tech/source/gallery/5619/559162/large_width.jpg"
      },
      {
        generation: "E140/E150", yearStart: 2006, yearEnd: 2013,
        power: "99 – 180 hp", price: "€17,000 – €26,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.4L inline-4", "1.6L inline-4", "1.8L inline-4", "2.0L D-4D diesel"],
        drivetrain: "Front-wheel drive",
        consumption: "6 – 8L",
        image: "https://www.autodata1.com/media/toyota/pics/toyota-corolla-x-e140-e150-[41620].jpg"
      },
      {
        generation: "E160/E170", yearStart: 2012, yearEnd: 2018,
        power: "99 – 132 hp", price: "€18,000 – €27,000",
        fuelType: "Petrol",
        engine: ["1.33L inline-4", "1.6L inline-4", "1.8L inline-4"],
        drivetrain: "Front-wheel drive",
        consumption: "6 – 8L",
        image: "https://cdn3.focus.bg/autodata/i/toyota/corolla/corolla-xi-e160-e170/large/1b166bc9cc23e9b17d58eb75ebe4eef0.jpg"
      },
      {
        generation: "E210", yearStart: 2018, yearEnd: null,
        power: "122 – 196 hp", price: "€23,000 – €35,000",
        fuelType: "Petrol, Hybrid",
        engine: ["2.0L Dynamic Force petrol", "1.8L hybrid", "2.0L hybrid"],
        drivetrain: "Front-wheel drive / AWD (hybrid)",
        consumption: "4 – 7L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/toyota-corolla-eu-2022-7422_8.jpg"
      }
    ]
  },
  {
    id: 13, make: "Toyota", model: "RAV4", type: "SUV",
    description: "A hybrid SUV with strong real-world fuel economy and confident all-weather grip.",
    years: [
      {
        generation: "XA10 (1st gen)", yearStart: 1994, yearEnd: 2000,
        power: "120 – 129 hp", price: "€18,000 – €28,000",
        fuelType: "Petrol",
        engine: ["2.0L inline-4"],
        drivetrain: "Front-wheel drive / Part-time AWD",
        consumption: "8 – 11L",
        image: "https://drive.place/thumb/toyota/toyota_rav_4_i_offroad_5d_2_thumb3.jpg"
      },
      {
        generation: "XA20 (2nd gen)", yearStart: 2000, yearEnd: 2005,
        power: "148 – 150 hp", price: "€22,000 – €32,000",
        fuelType: "Petrol",
        engine: ["2.0L inline-4", "2.4L inline-4"],
        drivetrain: "Front-wheel drive / Full-time AWD",
        consumption: "8 – 11L",
        image: "https://d-pt.ppstatic.pl/k/r/1/f3/fc/62456b460b50a_p.jpg?1648716614"
      },
      {
        generation: "XA30 (3rd gen)", yearStart: 2005, yearEnd: 2012,
        power: "150 – 177 hp", price: "€24,000 – €36,000",
        fuelType: "Petrol, Diesel",
        engine: ["2.0L inline-4", "2.4L inline-4", "2.2L D-4D diesel"],
        drivetrain: "Front-wheel drive / Full-time AWD",
        consumption: "7 – 11L",
        image: "https://s1.cdn.autoevolution.com/images/gallery/TOYOTARAV45Doors-4308_6.jpg"
      },
      {
        generation: "XA40 (4th gen)", yearStart: 2012, yearEnd: 2018,
        power: "150 – 197 hp", price: "€26,000 – €40,000",
        fuelType: "Petrol, Diesel, Hybrid",
        engine: ["2.0L inline-4", "2.5L inline-4 hybrid", "2.2L diesel"],
        drivetrain: "Front-wheel drive / AWD",
        consumption: "6 – 10L",
        image: "https://www.cataloge.eu/media/toyota/37/en/02-Toyota-RAV4-XA40-facelift-2016.jpg"
      },
      {
        generation: "XA50 (5th gen)", yearStart: 2018, yearEnd: null,
        power: "175 – 306 hp", price: "€30,000 – €52,000",
        fuelType: "Petrol, Hybrid, PHEV",
        engine: ["2.0L Dynamic Force petrol", "2.5L hybrid (E-Four AWD)", "2.5L PHEV"],
        drivetrain: "Front-wheel drive / E-Four electric AWD",
        consumption: "5 – 8L \n 1L PHEV",
        image: "https://s1.cdn.autoevolution.com/images/gallery/toyota-rav4-2025-7910_25.jpg"
      }
    ]
  },
  {
    id: 14, make: "Toyota", model: "Supra", type: "Coupe",
    description: "Toyota's revived sports coupé, a rear-drive grand tourer with sharp handling.",
    years: [
      {
        generation: "A60 (Mk3)", yearStart: 1986, yearEnd: 1993,
        power: "171 – 204 hp", price: "€20,000 – €35,000",
        fuelType: "Petrol",
        engine: ["3.0L inline-6 (7M-GE / 7M-GTE turbo)"],
        drivetrain: "Rear-wheel drive",
        consumption: "10 – 13L",
        image: "https://i.ytimg.com/vi/eHobKEnTpSo/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDwf59UsTl3ATlJiaDN_J5qhLGbxg"
      },
      {
        generation: "A80 (Mk4)", yearStart: 1993, yearEnd: 2002,
        power: "220 – 330 hp", price: "€35,000 – €55,000",
        fuelType: "Petrol",
        engine: ["3.0L inline-6 (2JZ-GE / 2JZ-GTE twin turbo)"],
        drivetrain: "Rear-wheel drive",
        consumption: "11 – 14L",
        image: "https://res.cloudinary.com/jerrick/image/upload/v1685216109/64725b6d365a8f001d7f50a1.jpg"
      },
      {
        generation: "A90 (Mk5)", yearStart: 2019, yearEnd: null,
        power: "258 – 387 hp", price: "€50,000 – €68,000",
        fuelType: "Petrol",
        engine: ["2.0L turbo inline-4 (B48)", "3.0L turbo inline-6 (B58)"],
        drivetrain: "Rear-wheel drive",
        consumption: "8 – 10L",
        image: "https://static0.carbuzzimages.com/wordpress/wp-content/uploads/2024/12/2025-toyota-gr-supra-17.jpg?q=70&fit=crop&w=1600&h=900&dpr=1"
      }
    ]
  },
  {
    id: 15, make: "Ford", model: "Mustang", type: "Coupe",
    description: "America's quintessential muscle car, V8 power and rear-drive theatre.",
    years: [
      {
        generation: "Fox Body (3rd gen)", yearStart: 1979, yearEnd: 1993,
        power: "88 – 225 hp", price: "€7,000 – €15,000",
        fuelType: "Petrol",
        engine: ["2.3L inline-4 turbo", "3.8L V6", "5.0L V8 HO"],
        drivetrain: "Rear-wheel drive",
        consumption: "10 – 15L",
        image: "https://news.classicindustries.com/hubfs/1993%20Mustang%20Cobra%20lead%201000%20px.png"
      },
      {
        generation: "SN95 / New Edge (4th gen)", yearStart: 1994, yearEnd: 2004,
        power: "150 – 305 hp", price: "€15,000 – €28,000",
        fuelType: "Petrol",
        engine: ["3.8L V6", "4.6L SOHC V8", "4.6L DOHC V8 (Cobra)"],
        drivetrain: "Rear-wheel drive",
        consumption: "10 – 14L",
        image: "https://s3.us-east-2.amazonaws.com/prod.mm.com/img/articles/1995-Ford-Mustang-Cobra-coupe-neg-CN315001-052.jpeg"
      },
      {
        generation: "S197", yearStart: 2005, yearEnd: 2014,
        power: "210 – 662 hp", price: "€22,000 – €55,000",
        fuelType: "Petrol",
        engine: ["4.0L V6", "5.0L V8 Coyote", "5.4L V8 supercharged (GT500)"],
        drivetrain: "Rear-wheel drive",
        consumption: "10 – 14L",
        image: "https://lapmeta.com/storage/vi-images/86aZXkjZDp.jpg"
      },
      {
        generation: "S550", yearStart: 2015, yearEnd: 2023,
        power: "310 – 760 hp", price: "€35,000 – €75,000",
        fuelType: "Petrol",
        engine: ["2.3L EcoBoost turbo inline-4", "5.0L Coyote V8", "5.2L Predator V8 (GT500)"],
        drivetrain: "Rear-wheel drive",
        consumption: "9 – 14L",
        image: "https://www.tunershop.shop/media/wysiwyg/Blog/Vogtland/Ford_Mustang/Ford_Mustang_Main.jpg"
      },
      {
        generation: "S650", yearStart: 2023, yearEnd: null,
        power: "315 – 500 hp", price: "€42,000 – €80,000",
        fuelType: "Petrol",
        engine: ["2.3L EcoBoost inline-4", "5.0L Coyote V8"],
        drivetrain: "Rear-wheel drive",
        consumption: "9 – 13L",
        image: "https://hips.hearstapps.com/hmg-prod/images/2025-ford-mustang-gtd-115-68c81feb4b4a0.jpg?crop=0.604xw:0.510xh;0.253xw,0.279xh&resize=1200:*"
      }
    ]
  },
  {
    id: 16, make: "Ford", model: "Kuga", type: "SUV",
    description: "A family-friendly hybrid SUV focused on efficiency and everyday usability.",
    years: [
      {
        generation: "Mk1 (C394)", yearStart: 2008, yearEnd: 2012,
        power: "120 – 200 hp", price: "€22,000 – €34,000",
        fuelType: "Petrol, Diesel",
        engine: ["2.5L inline-5 turbo", "2.0L TDCi diesel", "2.0T petrol"],
        drivetrain: "FWD / AWD",
        consumption: "7 – 11L",
        image: "https://d-art.ppstatic.pl/kadry/k/r/1/1f/67/624f37c48f6d4_o_original.jpg"
      },
      {
        generation: "Mk2 (C520)", yearStart: 2012, yearEnd: 2019,
        power: "120 – 182 hp", price: "€26,000 – €40,000",
        fuelType: "Petrol, Diesel",
        engine: ["1.5T EcoBoost", "2.0T EcoBoost", "2.0L TDCi diesel"],
        drivetrain: "FWD / AWD",
        consumption: "6 – 9 L",
        image: "https://www.telegraph.co.uk/multimedia/archive/02891/Ford-Kuga-Tit-X_2891653b.jpg"
      },
      {
        generation: "Mk3 (CEP)", yearStart: 2019, yearEnd: null,
        power: "120 – 225 hp", price: "€30,000 – €48,000",
        fuelType: "Petrol, Hybrid, PHEV",
        engine: ["1.5T EcoBoost", "2.5L Duratec hybrid", "2.5L PHEV"],
        drivetrain: "FWD / AWD",
        consumption: "5 – 8L \n 1 – 2 L PHEV",
        image: "https://s1.cdn.autoevolution.com/images/gallery/ford-kuga-2024-7649_14.jpg"
      }
    ]
  }
];

export const YEAR_SPAN = 2; 

const MAKES = ["All", ...Array.from(new Set(CAR_MODELS.map(c => c.make))).sort()];

// Returns the latest generation object for grid card display
function getLatestGeneration(model) {
  if (!model?.years?.length) return null;
  return model.years.reduce((latest, g) => {
    const latestEnd = latest.yearEnd ?? Infinity;
    const gEnd = g.yearEnd ?? Infinity;
    return gEnd > latestEnd ? g : latest;
  });
}

function FactItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#ccc", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SpecCard({ label, value }) {
  return (
    <div className="stat-box">
      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#e0a820", whiteSpace: "pre-line" }}>{value}</div>
    </div>
  );
}

export default function CarModels() {
  const [view, setView] = useState("select"); // "select" | "detail"
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedGenIndex, setSelectedGenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMake, setFilterMake] = useState("All");
  const [imgError, setImgError] = useState(false);

  const filteredModels = useMemo(() => {
    return CAR_MODELS.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || `${c.make} ${c.model}`.toLowerCase().includes(q);
      const matchMake = filterMake === "All" || c.make === filterMake;
      return matchQ && matchMake;
    });
  }, [searchQuery, filterMake]);

  function handleSelectModel(model) {
    setSelectedModel(model);
    // Default to the latest generation
    const latestIndex = model.years.reduce((li, g, i) => {
      const latestEnd = model.years[li].yearEnd ?? Infinity;
      const gEnd = g.yearEnd ?? Infinity;
      return gEnd > latestEnd ? i : li;
    }, 0);
    setSelectedGenIndex(latestIndex);
    setImgError(false);
    setView("detail");
  }

  const imgSrc = selectedModel?.years[selectedGenIndex]?.image || "";
  const activeGen = selectedModel ? selectedModel.years[selectedGenIndex] : null;
  const latestGen = selectedModel ? getLatestGeneration(selectedModel) : null;

  // ── SELECT VIEW ──────────────────────────────────────────────────────────────
  if (view === "select") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0d0f12", color: "#f0f0f0" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #1a1c21; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          .car-tile { background: #16181e; border: 1px solid #252830; border-radius: 12px; padding: 24px; cursor: pointer; transition: all 0.2s; }
          .car-tile:hover { border-color: #e0a820; transform: translateY(-2px); }
          .make-pill { background: #1e2028; border: 1px solid #2e3040; border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer; color: #aaa; transition: all 0.15s; white-space: nowrap; }
          .make-pill.active { background: #e0a820; border-color: #e0a820; color: #0d0f12; font-weight: 600; }
          .search-in { background: #16181e; border: 1px solid #252830; border-radius: 10px; padding: 10px 14px 10px 38px; font-size: 14px; color: #f0f0f0; outline: none; width: 100%; font-family: inherit; }
          .search-in::placeholder { color: #555; }
          .search-in:focus { border-color: #e0a820; }
        `}</style>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 80px" }}>
          
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:".08em", color:"#e0a820" }}>Catalogue</div>
          </div>

          <div style={{ fontSize: 14, color: "#666", marginBottom: 24}}>
              Browse specifications by generation
            </div>
        

          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#555" }}><img src="/icons/magnifying-glass.png" alt="Search" style={{
              position: "absolute",top: "50%",transform: "translateY(-50%)",width: 25,height: 25,gap: 5}}/></span>
            <input
              className="search-in"
              placeholder="Search make or model…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
            {MAKES.map(m => (
              <button key={m} className={`make-pill${filterMake === m ? " active" : ""}`} onClick={() => setFilterMake(m)}>
                {m}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {filteredModels.map(m => {
              const latest = getLatestGeneration(m);
              return (
                <div key={m.id} className="car-tile" onClick={() => handleSelectModel(m)}>
                  <div style={{
                    height: 140, borderRadius: 8, marginBottom: 12, overflow: "hidden",
                    background: "#0d0f12", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                      <img
                        src={latest?.image}
                        alt={`${m.make} ${m.model}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    
                    <div style={{
                      display: latest?.image ? "none" : "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 32, width: "100%", height: "100%",
                    }}>🚗</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>{m.make}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#f0f0f0" }}>{m.model}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "#e0a820", fontWeight: 600 }}>
                      {latest?.power ?? "—"}
                    </span>
                    <span style={{
                      fontSize: 10, background: "#1e2028", border: "1px solid #2e3040",
                      color: "#888", borderRadius: 20, padding: "2px 8px",
                    }}>{m.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>
                    {m.years.length} generation{m.years.length !== 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredModels.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 14 }}>
              No models match your search
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────────
  const model = selectedModel;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0d0f12", color: "#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1a1c21; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .stat-box { background: #16181e; border: 1px solid #252830; border-radius: 10px; padding: 14px 16px; }
        .gen-chip { background: #16181e; border: 1px solid #252830; border-radius: 20px; padding: 7px 16px; font-size: 13px; cursor: pointer; color: #888; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
        .gen-chip.active { background: #e0a820; border-color: #e0a820; color: #0d0f12; font-weight: 700; }
        .back-btn { background: none; border: 1px solid #252830; border-radius: 8px; padding: 8px 14px; color: #888; font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .back-btn:hover { border-color: #e0a820; color: #e0a820; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.08em", color: "#e0a820" }}>
            CARCARE
          </div>
          <button className="back-btn" onClick={() => setView("select")}>
            ← Browse all models
          </button>
        </div>

        {/* Model hero */}
        <div style={{
          background: "#16181e", border: "1px solid #252830", borderRadius: 16,
          overflow: "hidden", marginBottom: 20,
          display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 200,
        }}>
          {/* Image */}
          <div style={{ position: "relative", minHeight: 180, background: "#0d0f12", overflow: "hidden" }}>
            {imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt={`${model.make} ${model.model}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 180 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", minHeight: 180,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 64, opacity: 0.3,
              }}>🚗</div>
            )}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(13,15,18,0.9))",
              padding: "20px 16px 12px",
            }}>
              <div style={{ fontSize: 11, color: "#e0a820", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {model.type}
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{model.make}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.04em", color: "#f0f0f0", lineHeight: 1 }}>
                {model.model}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 10, lineHeight: 1.6 }}>{model.description}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
                {model.years.length} generation{model.years.length !== 1 ? "s" : ""} · {model.years[0].yearStart}–present
              </div>
            </div>

            {activeGen && (
              <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
                <FactItem label="Generation" value={activeGen.generation} />
                <FactItem label="Years" value={`${activeGen.yearStart}–${activeGen.yearEnd ?? "present"}`} />
                <FactItem label="Drivetrain" value={activeGen.drivetrain} />
              </div>
            )}
          </div>
        </div>

        {/* Generation selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Select generation
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {model.years.map((gen, i) => (
              <button
                key={gen.generation}
                className={`gen-chip${selectedGenIndex === i ? " active" : ""}`}
                onClick={() => setSelectedGenIndex(i)}
              >
                {gen.generation} <span style={{ opacity: 0.6, fontSize: 11 }}>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Spec cards for the selected generation */}
        {activeGen && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
              <SpecCard label="Power" value={activeGen.power} />
              <SpecCard label="Fuel Type" value={activeGen.fuelType} />
              <SpecCard label="Consumption" value={activeGen.consumption} />
              <SpecCard label="Starting price" value={activeGen.price} />
            </div>

            {/* Engine list */}
            {Array.isArray(activeGen.engine) && activeGen.engine.length > 1 && (
              <div style={{ background: "#16181e", border: "1px solid #252830", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Available engines
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {activeGen.engine.map((eng, i) => (
                    <span key={i} style={{
                      background: "#1e2028", border: "1px solid #2e3040",
                      borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#ccc",
                    }}>
                      {eng}
                    </span>
                  ))}
                </div>
              </div>
            )}

            
          </>
        )}
      </div>
    </div>
  );
}