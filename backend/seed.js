const db = require("./db");
const places = [
 {name:"Manali",state:"Himachal Pradesh",region:"Mountains",description:"A Himalayan escape of pine forests, mountain cafés, river valleys and snow-capped peaks.",image:"https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900",budget:8500,bestTime:"October – June",tags:["Mountains","Adventure","Snow"],highlights:["Solang Valley","Old Manali","Jogini Falls"],duration:"4–5 days",rating:4.8},
 {name:"Kasol",state:"Himachal Pradesh",region:"Mountains",description:"A laid-back riverside village with forest trails, cafés and unforgettable Parvati Valley views.",image:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900",budget:6500,bestTime:"March – June",tags:["Backpacking","Nature","Trekking"],highlights:["Chalal Trail","Parvati River","Tosh"],duration:"3–4 days",rating:4.7},
 {name:"Rishikesh",state:"Uttarakhand",region:"Adventure",description:"Find your flow with river rafting, yoga by the Ganga, suspension bridges and Himalayan foothills.",image:"https://images.unsplash.com/photo-1587922546307-776227941871?w=900",budget:5000,bestTime:"September – April",tags:["Adventure","Spiritual","River"],highlights:["Lakshman Jhula","River Rafting","Beatles Ashram"],duration:"2–3 days",rating:4.8},
 {name:"Chopta",state:"Uttarakhand",region:"Mountains",description:"A peaceful meadow base for the Tungnath trek, wide Himalayan panoramas and starry skies.",image:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",budget:7000,bestTime:"March – June",tags:["Trekking","Quiet","Nature"],highlights:["Tungnath Temple","Chandrashila","Deoria Tal"],duration:"3–4 days",rating:4.9},
 {name:"Jaipur",state:"Rajasthan",region:"Culture",description:"Explore pink-hued streets, royal forts, colourful bazaars and rich Rajasthani food.",image:"https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=900",budget:6000,bestTime:"October – March",tags:["Culture","Heritage","Food"],highlights:["Amber Fort","Hawa Mahal","City Palace"],duration:"2–3 days",rating:4.7},
 {name:"Goa",state:"Goa",region:"Beach",description:"A sun-soaked mix of golden beaches, Portuguese heritage, coastal food and relaxed evenings.",image:"https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900",budget:11000,bestTime:"November – February",tags:["Beach","Food","Relax"],highlights:["Palolem Beach","Fontainhas","Dudhsagar Falls"],duration:"4–5 days",rating:4.6},
 {name:"Spiti Valley",state:"Himachal Pradesh",region:"Adventure",description:"A high-altitude desert of dramatic roads, ancient monasteries and quiet mountain villages.",image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",budget:18000,bestTime:"June – September",tags:["Adventure","Road Trip","Mountains"],highlights:["Key Monastery","Chandratal","Kibber"],duration:"7–9 days",rating:4.9},
 {name:"Meghalaya",state:"Meghalaya",region:"Nature",description:"Chase waterfalls, living root bridges, emerald valleys and misty landscapes in the Northeast.",image:"https://images.unsplash.com/photo-1500534623283-312aade485b7?w=900",budget:14000,bestTime:"October – April",tags:["Nature","Waterfalls","Trekking"],highlights:["Dawki","Nongriat","Nohkalikai Falls"],duration:"5–7 days",rating:4.8}
];
function seedDestinations() {
  if (db.destinations.count() === 0) {
    db.destinations.insertMany(places);
    console.log("Sample destinations added.");
  }
}
module.exports = { seedDestinations };
