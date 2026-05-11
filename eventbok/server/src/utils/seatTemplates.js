// Seat layout templates keyed by capacity (500 / 2000 / 5000)
// Seat counts: 500 = 2×25+4×25+10×35 = 500
//              2000 = 4×30+6×40+10×56+20×54 = 2000
//              5000 = 4×35+6×45+11×70+44×55+28×50 = 5000

export const SEAT_TEMPLATES = {
  500: {
    label: "Small Venue (500 ที่นั่ง)",
    sqlTemplate: "concert_hall",
    zones: [
      { name: "VIP Zone",     type: "vip",     seatsPerRow: 25, rows: ["A","B"] },
      { name: "Premium Zone", type: "premium", seatsPerRow: 25, rows: ["C","D","E","F"] },
      { name: "Regular Zone", type: "regular", seatsPerRow: 35, rows: ["G","H","I","J","K","L","M","N","O","P"] },
    ],
    defaultPrices: { "VIP Zone": 2500, "Premium Zone": 1500, "Regular Zone": 800 },
  },
  2000: {
    label: "Concert Hall (2000 ที่นั่ง)",
    sqlTemplate: "concert_hall",
    zones: [
      { name: "VIP Gold", type: "vip",     seatsPerRow: 30, rows: ["A","B","C","D"] },
      { name: "VIP",      type: "vip",     seatsPerRow: 40, rows: ["E","F","G","H","I","J"] },
      { name: "Premium",  type: "premium", seatsPerRow: 56, rows: ["K","L","M","N","O","P","Q","R","S","T"] },
      { name: "Regular",  type: "regular", seatsPerRow: 54, rows: [
        "U","V","W","X","Y","Z",
        "AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN",
      ]},
    ],
    defaultPrices: { "VIP Gold": 4500, "VIP": 3000, "Premium": 2000, "Regular": 1200 },
  },
  5000: {
    label: "Arena (5000 ที่นั่ง)",
    sqlTemplate: "arena_stadium",
    zones: [
      { name: "VIP Platinum",  type: "vip",     seatsPerRow: 35, rows: ["A","B","C","D"] },
      { name: "VIP Gold",      type: "vip",     seatsPerRow: 45, rows: ["E","F","G","H","I","J"] },
      { name: "Premium",       type: "premium", seatsPerRow: 70, rows: ["K","L","M","N","O","P","Q","R","S","T","U"] },
      { name: "Regular Floor", type: "regular", seatsPerRow: 55, rows: [
        "V","W","X","Y","Z",
        "AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ",
        "BA","BB","BC","BD","BE","BF","BG","BH","BI","BJ","BK","BL","BM",
      ]},
      { name: "Upper Level",   type: "regular", seatsPerRow: 50, rows: [
        "UA","UB","UC","UD","UE","UF","UG","UH","UI","UJ","UK","UL","UM","UN",
        "UO","UP","UQ","UR","US","UT","UU","UV","UW","UX","UY","UZ","VA","VB",
      ]},
    ],
    defaultPrices: { "VIP Platinum": 8000, "VIP Gold": 6000, "Premium": 4000, "Regular Floor": 2500, "Upper Level": 1500 },
  },
};
