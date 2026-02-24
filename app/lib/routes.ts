export const PORTS = ['Suva','Savusavu','Labasa','Lautoka','Levuka','Koro','Taveuni','Kadavu','Rotuma','Yasawa']

export type Ferry = { id:number; operator:string; ship:string; icon:string; departs:string; arrives:string; duration:string; economy:number; cabin:number; tag:string; tagColor:string }
export type Booking = { ferry:Ferry; selectedClass:'Economy'|'Cabin'; origin:string; destination:string; date:string; passengerName:string; passengerId:string; phone:string; ref:string; price:number }

const ROUTES: Record<string,Ferry[]> = {
  'Suva-Savusavu':[
    {id:1,operator:'Goundar Shipping',ship:'MV Cagimaira II',icon:'⚓',departs:'10:00',arrives:'00:00',duration:'~14 hrs',economy:45,cabin:90,tag:'⚡ Available',tagColor:'green'},
    {id:2,operator:'Patterson Brothers',ship:'MV Sinu-i-Wasa',icon:'🚢',departs:'16:00',arrives:'08:00',duration:'~16 hrs',economy:39,cabin:78,tag:'🔥 Popular',tagColor:'gold'},
  ],
  'Suva-Labasa':[{id:3,operator:'Goundar Shipping',ship:'MV Lomaiviti Princess',icon:'⚓',departs:'08:00',arrives:'06:00',duration:'~22 hrs',economy:55,cabin:110,tag:'⚡ Available',tagColor:'green'}],
  'Suva-Lautoka':[
    {id:4,operator:'Patterson Brothers',ship:'MV Adi Savusavu',icon:'🚢',departs:'18:00',arrives:'06:00',duration:'~12 hrs',economy:42,cabin:84,tag:'🔥 Popular',tagColor:'gold'},
    {id:5,operator:'Goundar Shipping',ship:'MV Cagimaira II',icon:'⚓',departs:'06:00',arrives:'18:00',duration:'~12 hrs',economy:40,cabin:80,tag:'⚡ Available',tagColor:'green'},
  ],
  'Suva-Levuka':[{id:6,operator:'Patterson Brothers',ship:'MV Ovalau Ferry',icon:'🚢',departs:'14:00',arrives:'17:00',duration:'~3 hrs',economy:18,cabin:0,tag:'⚡ Available',tagColor:'green'}],
  'Suva-Koro':[{id:7,operator:'Goundar Shipping',ship:'MV Lomaiviti Princess',icon:'⚓',departs:'11:00',arrives:'20:00',duration:'~9 hrs',economy:38,cabin:75,tag:'🔥 Popular',tagColor:'gold'}],
  'Suva-Taveuni':[{id:8,operator:'Goundar Shipping',ship:'MV Cagimaira II',icon:'⚓',departs:'10:00',arrives:'04:00',duration:'~18 hrs',economy:60,cabin:120,tag:'⚡ Available',tagColor:'green'}],
  'Suva-Kadavu':[{id:9,operator:'Goundar Shipping',ship:'MV Lomaiviti Princess VII',icon:'⚓',departs:'09:00',arrives:'15:00',duration:'~6 hrs',economy:28,cabin:55,tag:'⚡ Available',tagColor:'green'}],
  'Lautoka-Yasawa':[{id:10,operator:'Yasawa Island Ferry',ship:'MV Yasawa Flyer',icon:'🛥️',departs:'09:00',arrives:'18:00',duration:'~9 hrs',economy:85,cabin:0,tag:'🌊 Scenic',tagColor:'blue'}],
}

export function getRoutes(origin:string, destination:string): Ferry[] {
  return ROUTES[`${origin}-${destination}`] || ROUTES[`${destination}-${origin}`] || []
}
