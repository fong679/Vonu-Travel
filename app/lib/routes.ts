export const PORTS = ['Suva','Savusavu','Labasa','Lautoka','Levuka','Koro','Taveuni','Kadavu','Rotuma','Yasawa']

export type Ferry = {
  id:number; operator:string; ship:string; icon:string
  departs:string; arrives:string; duration:string
  economy:number; cabin:number; tag:string; tagColor:string
  seatsEconomy:number; seatsCabin:number; daysOfWeek:number[]
}

export type Passenger = { adults:number; children:number; infants:number }

export type Booking = {
  ferry:Ferry; selectedClass:'Economy'|'Cabin'
  origin:string; destination:string; date:string
  passengerName:string; passengerId:string; phone:string
  ref:string; price:number; passengers:Passenger
  status:'upcoming'|'completed'|'cancelled'
  departureDateTime:string
}

const ROUTES: Record<string,Ferry[]> = {
  'Suva-Savusavu':[
    {id:1,operator:'Goundar Shipping',ship:'MV Cagimaira II',icon:'⚓',departs:'10:00',arrives:'00:00',duration:'~14 hrs',economy:45,cabin:90,tag:'⚡ Available',tagColor:'green',seatsEconomy:120,seatsCabin:24,daysOfWeek:[1,3,5]},
    {id:2,operator:'Patterson Brothers',ship:'MV Sinu-i-Wasa',icon:'🚢',departs:'16:00',arrives:'08:00',duration:'~16 hrs',economy:39,cabin:78,tag:'🔥 Popular',tagColor:'gold',seatsEconomy:80,seatsCabin:16,daysOfWeek:[2,4,6]},
  ],
  'Suva-Labasa':[
    {id:3,operator:'Goundar Shipping',ship:'MV Lomaiviti Princess',icon:'⚓',departs:'08:00',arrives:'06:00',duration:'~22 hrs',economy:55,cabin:110,tag:'⚡ Available',tagColor:'green',seatsEconomy:100,seatsCabin:20,daysOfWeek:[1,4]},
  ],
  'Suva-Lautoka':[
    {id:4,operator:'Patterson Brothers',ship:'MV Adi Savusavu',icon:'🚢',departs:'18:00',arrives:'06:00',duration:'~12 hrs',economy:42,cabin:84,tag:'🔥 Popular',tagColor:'gold',seatsEconomy:90,seatsCabin:18,daysOfWeek:[1,2,3,4,5]},
    {id:5,operator:'Goundar Shipping',ship:'MV Cagimaira II',icon:'⚓',departs:'06:00',arrives:'18:00',duration:'~12 hrs',economy:40,cabin:80,tag:'⚡ Available',tagColor:'green',seatsEconomy:110,seatsCabin:22,daysOfWeek:[0,3,6]},
  ],
  'Suva-Levuka':[
    {id:6,operator:'Patterson Brothers',ship:'MV Ovalau Ferry',icon:'🚢',departs:'14:00',arrives:'17:00',duration:'~3 hrs',economy:18,cabin:0,tag:'⚡ Available',tagColor:'green',seatsEconomy:60,seatsCabin:0,daysOfWeek:[1,3,5,0]},
  ],
  'Suva-Koro':[
    {id:7,operator:'Goundar Shipping',ship:'MV Lomaiviti Princess',icon:'⚓',departs:'11:00',arrives:'20:00',duration:'~9 hrs',economy:38,cabin:75,tag:'🔥 Popular',tagColor:'gold',seatsEconomy:85,seatsCabin:16,daysOfWeek:[2,5]},
  ],
  'Suva-Taveuni':[
    {id:8,operator:'Goundar Shipping',ship:'MV Cagimaira II',icon:'⚓',departs:'10:00',arrives:'04:00',duration:'~18 hrs',economy:60,cabin:120,tag:'⚡ Available',tagColor:'green',seatsEconomy:95,seatsCabin:20,daysOfWeek:[1,4]},
  ],
  'Suva-Kadavu':[
    {id:9,operator:'Goundar Shipping',ship:'MV Lomaiviti Princess VII',icon:'⚓',departs:'09:00',arrives:'15:00',duration:'~6 hrs',economy:28,cabin:55,tag:'⚡ Available',tagColor:'green',seatsEconomy:70,seatsCabin:14,daysOfWeek:[3,6]},
  ],
  'Lautoka-Yasawa':[
    {id:10,operator:'Yasawa Island Ferry',ship:'MV Yasawa Flyer',icon:'🛥️',departs:'09:00',arrives:'18:00',duration:'~9 hrs',economy:85,cabin:0,tag:'🌊 Scenic',tagColor:'blue',seatsEconomy:50,seatsCabin:0,daysOfWeek:[1,2,3,4,5,6,0]},
  ],
}

export function getRoutes(origin:string, destination:string): Ferry[] {
  return ROUTES[`${origin}-${destination}`] || ROUTES[`${destination}-${origin}`] || []
}

export function getRoutesForDate(origin:string, destination:string, date:Date): Ferry[] {
  return getRoutes(origin,destination).filter(f=>f.daysOfWeek.includes(date.getDay()))
}

export function calculatePrice(ferry:Ferry, cls:'Economy'|'Cabin', passengers:Passenger): number {
  const base=cls==='Economy'?ferry.economy:ferry.cabin
  return Math.round(base*passengers.adults+(base*0.5)*passengers.children)
}

export function formatDate(date:Date): string {
  return date.toLocaleDateString('en-FJ',{weekday:'short',day:'numeric',month:'short',year:'numeric'})
}
