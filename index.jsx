import { useState, useMemo } from "react";

// ─── ДАННЫЕ ───────────────────────────────────────────────────────────────────

const CATEGORY_PRICES = {
  "Одежда": 850, "Канцелярия": 120, "Электроника": 3200,
  "Аксессуары": 650, "Полиграфия": 45, "Прочее": 200,
};
const CATEGORIES = Object.keys(CATEGORY_PRICES);

const INIT_BRANCHES = [
  { id:1, name:"Центральный офис",   city:"Москва",         managerId:4 },
  { id:2, name:"Филиал Север",       city:"Санкт-Петербург",managerId:6 },
  { id:3, name:"Филиал Юг",          city:"Краснодар",      managerId:7 },
  { id:4, name:"Филиал Восток",      city:"Екатеринбург",   managerId:8 },
];

const INIT_USERS = [
  { id:1, name:"Маша Иванова",    role:"admin",    branchId:1 },
  { id:10,name:"Айгерим",         role:"admin",    branchId:1 },
  { id:2, name:"Петров Алексей",  role:"manager",  branchId:1 },
  { id:3, name:"Сидорова Елена",  role:"employee", branchId:2 },
  { id:4, name:"Козлов Дмитрий", role:"director", branchId:1 },
  { id:5, name:"Иванов Сергей",   role:"employee", branchId:3 },
  { id:6, name:"Орлова Наталья",  role:"director", branchId:2 },
  { id:7, name:"Захаров Виктор",  role:"director", branchId:3 },
  { id:8, name:"Соколова Анна",   role:"director", branchId:4 },
  { id:9, name:"Морозов Кирилл",  role:"employee", branchId:4 },
];

const INIT_LOCATIONS = [
  { id:1, name:"Главный склад", parentId:null, type:"warehouse" },
  { id:2, name:"Стеллаж A",     parentId:1,    type:"shelf" },
  { id:3, name:"Стеллаж B",     parentId:1,    type:"shelf" },
  { id:4, name:"A1 · Полка 1", parentId:2,    type:"section" },
  { id:5, name:"A1 · Полка 2", parentId:2,    type:"section" },
  { id:6, name:"A2 · Полка 1", parentId:2,    type:"section" },
  { id:7, name:"B1 · Полка 1", parentId:3,    type:"section" },
  { id:8, name:"B2 · Полка 1", parentId:3,    type:"section" },
];

const INIT_PRODUCTS = [
  { id:1, name:"Футболка белая L",     sku:"TSH-WL-001",  category:"Одежда",      price:850,  locationId:4, archived:false },
  { id:2, name:"Ручка с логотипом",    sku:"PEN-001",     category:"Канцелярия",  price:120,  locationId:5, archived:false },
  { id:3, name:"Блокнот А5",           sku:"NTB-A5-001",  category:"Канцелярия",  price:180,  locationId:5, archived:false },
  { id:4, name:"Пауэрбанк 10000 mAh", sku:"PWR-10K-001", category:"Электроника", price:3200, locationId:6, archived:false },
  { id:5, name:"Бейсболка",            sku:"CAP-001",     category:"Одежда",      price:650,  locationId:4, archived:false },
  { id:6, name:"Шопер брендированный",sku:"BAG-SHP-001",  category:"Аксессуары",  price:420,  locationId:7, archived:false },
  { id:7, name:"Стикерпак",           sku:"STK-001",     category:"Полиграфия",  price:45,   locationId:8, archived:false },
  { id:8, name:"Зонт брендированный", sku:"UMB-001",     category:"Аксессуары",  price:980,  locationId:7, archived:false },
];

const da = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split("T")[0]; };
const df = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const TODAY = new Date().toISOString().split("T")[0];

const INIT_MOVEMENTS = [
  {id:1,  type:"in",  productId:1,qty:100,locationId:4,issuerId:1,date:da(30),notes:"Начальный приход"},
  {id:2,  type:"in",  productId:2,qty:200,locationId:5,issuerId:1,date:da(30),notes:""},
  {id:3,  type:"in",  productId:3,qty:150,locationId:5,issuerId:1,date:da(30),notes:""},
  {id:4,  type:"in",  productId:4,qty:20, locationId:6,issuerId:1,date:da(25),notes:""},
  {id:5,  type:"in",  productId:5,qty:50, locationId:4,issuerId:2,date:da(20),notes:""},
  {id:6,  type:"in",  productId:6,qty:80, locationId:7,issuerId:2,date:da(20),notes:""},
  {id:7,  type:"in",  productId:7,qty:300,locationId:8,issuerId:1,date:da(15),notes:""},
  {id:8,  type:"in",  productId:8,qty:15, locationId:7,issuerId:1,date:da(15),notes:""},
  {id:9,  type:"out", productId:1,qty:10, locationId:4,issuerId:1,recipientId:5,branchId:3,date:da(14),purpose:"Конференция Tech2025",dueDate:da(7)},
  {id:10, type:"out", productId:2,qty:50, locationId:5,issuerId:2,recipientId:5,branchId:3,date:da(10),purpose:"Выставка",            dueDate:da(3)},
  {id:11, type:"out", productId:3,qty:20, locationId:5,issuerId:1,recipientId:3,branchId:2,date:da(5), purpose:"Партнёры",            dueDate:df(10)},
  {id:12, type:"out", productId:4,qty:3,  locationId:6,issuerId:1,recipientId:2,branchId:1,date:da(20),purpose:"VIP-клиенты",         dueDate:da(5)},
  {id:13, type:"out", productId:5,qty:5,  locationId:4,issuerId:2,recipientId:9,branchId:4,date:da(8), purpose:"Мероприятие",         dueDate:da(5)},
  {id:14, type:"out", productId:7,qty:100,locationId:8,issuerId:1,recipientId:3,branchId:2,date:da(12),purpose:"Онбординг",           dueDate:df(5)},
  {id:15, type:"return",   productId:2,qty:20,locationId:5,issuerId:1,recipientId:5,branchId:3,date:da(2),condition:"хорошее",notes:""},
  {id:16, type:"writeoff", productId:1,qty:2, locationId:4,issuerId:1,date:da(5),notes:"Брак при транспортировке"},
];

const ROLES = { admin:"Администратор", manager:"Кладовщик", employee:"Сотрудник", director:"Руководитель" };
const TYPE_LABEL = { in:"Приход", out:"Выдача", return:"Возврат", writeoff:"Списание" };
const TYPE_COLOR = { in:"#16a34a", out:"#2563eb", return:"#7c3aed", writeoff:"#dc2626" };
const TYPE_BG    = { in:"#f0fdf4", out:"#eff6ff", return:"#faf5ff", writeoff:"#fef2f2" };

const fmt = n => new Intl.NumberFormat("ru-RU").format(n);
const rub = n => `${fmt(n)} ₽`;

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCU]    = useState(INIT_USERS[0]);
  const [products, setProducts] = useState(INIT_PRODUCTS);
  const [movements, setMov]     = useState(INIT_MOVEMENTS);
  const [view, setView]         = useState("dashboard");
  const [uid, setUid]           = useState(30);

  const stock = useMemo(() => {
    const s = {};
    movements.forEach(m => {
      if (!s[m.productId]) s[m.productId] = 0;
      if (m.type==="in"||m.type==="return") s[m.productId] += m.qty;
      else if (m.type==="out"||m.type==="writeoff") s[m.productId] -= m.qty;
    });
    return s;
  }, [movements]);

  const activeCheckouts = useMemo(() => {
    const map = {};
    movements.forEach(m => {
      if (m.type==="out") {
        const k=`${m.productId}__${m.recipientId}__${m.branchId||0}__${m.date}`;
        if (!map[k]) map[k]={...m, remaining:0};
        map[k].remaining += m.qty;
      }
      if (m.type==="return") {
        // find matching out
        Object.keys(map).forEach(k => {
          if (k.startsWith(`${m.productId}__${m.recipientId}__${m.branchId||0}`)) {
            map[k].remaining -= m.qty;
          }
        });
      }
    });
    return Object.values(map).filter(o => o.remaining > 0);
  }, [movements]);

  const overdue = useMemo(()=>activeCheckouts.filter(c=>c.dueDate&&c.dueDate<TODAY),[activeCheckouts]);

  const addMov = mov => { setMov(p=>[...p,{...mov,id:uid}]); setUid(n=>n+1); };

  const gp = id => products.find(p=>p.id===id)?.name ?? "—";
  const gu = id => INIT_USERS.find(u=>u.id===id)?.name ?? "—";
  const gb = id => INIT_BRANCHES.find(b=>b.id===id)?.name ?? "—";
  const gl = id => INIT_LOCATIONS.find(l=>l.id===id)?.name ?? "—";

  const can = a => {
    const r=currentUser.role;
    if (a==="edit")   return r==="admin"||r==="manager";
    if (a==="delete") return r==="admin";
    if (a==="move")   return r==="admin"||r==="manager";
    return true;
  };

  const NAV = [
    {id:"dashboard", label:"Главная",   icon:"⊞"},
    {id:"products",  label:"Товары",    icon:"▦"},
    {id:"stock",     label:"Остатки",   icon:"⊟"},
    {id:"movements", label:"Движения",  icon:"⇄"},
    {id:"debtors",   label:"Должники",  icon:"⏱", badge:overdue.length},
    {id:"branches",  label:"Филиалы",   icon:"◎"},
    {id:"reports",   label:"Отчёты",    icon:"≡"},
  ];

  const shared = { products, stock, movements, activeCheckouts, overdue, addMov, can, gp, gu, gb, gl, currentUser, setProducts };

  const VIEWS = {
    dashboard: <Dashboard {...shared}/>,
    products:  <Products  {...shared}/>,
    stock:     <StockView {...shared}/>,
    movements: <MovementsView {...shared}/>,
    debtors:   <Debtors   {...shared}/>,
    branches:  <Branches  {...shared}/>,
    reports:   <Reports   {...shared}/>,
  };

  return (
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",display:"flex",height:"100vh",background:"#f8fafc",overflow:"hidden"}}>
      <div style={{width:196,background:"white",display:"flex",flexDirection:"column",borderRight:"1px solid #e2e8f0",flexShrink:0}}>
        <div style={{padding:"18px 16px 12px",borderBottom:"1px solid #f1f5f9"}}>
          <div style={{fontWeight:800,fontSize:14,color:"#1e293b",letterSpacing:-0.3}}>МКТ·СКЛАД</div>
          <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>учёт товаров маркетинга</div>
        </div>
        <nav style={{flex:1,padding:"5px 0",overflowY:"auto"}}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)} style={{
              display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 14px",
              background:view===item.id?"#eff6ff":"transparent",
              border:"none",color:view===item.id?"#2563eb":"#64748b",
              fontSize:12,cursor:"pointer",textAlign:"left",
              borderLeft:view===item.id?"2px solid #2563eb":"2px solid transparent",
              fontWeight:view===item.id?600:400,
            }}>
              <span style={{fontSize:14,width:16,textAlign:"center"}}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge>0&&<span style={{marginLeft:"auto",background:"#ef4444",color:"white",borderRadius:8,padding:"1px 5px",fontSize:9,fontWeight:700}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"10px 12px",borderTop:"1px solid #f1f5f9",background:"#f8fafc"}}>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:0.8,marginBottom:5,textTransform:"uppercase"}}>Вы вошли как</div>
          <select value={currentUser.id} onChange={e=>setCU(INIT_USERS.find(u=>u.id===Number(e.target.value)))}
            style={{width:"100%",padding:"5px 7px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:11,color:"#1e293b",background:"white"}}>
            {INIT_USERS.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div style={{marginTop:5}}>
            <RoleBadge role={currentUser.role}/>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{background:"white",borderBottom:"1px solid #e2e8f0",padding:"11px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>{NAV.find(n=>n.id===view)?.label}</div>
          <div style={{fontSize:11,color:"#94a3b8"}}>{new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          {VIEWS[view]}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ stock, products, overdue, movements, activeCheckouts, gp, gu, gb }) {
  const totalQty   = Object.values(stock).reduce((a,b)=>a+b,0);
  const totalValue = products.filter(p=>!p.archived).reduce((a,p)=>(a+(stock[p.id]||0)*p.price),0);
  const recent     = [...movements].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[
          {label:"Позиций товаров", value:products.filter(p=>!p.archived).length, color:"#2563eb"},
          {label:"Единиц в наличии",value:fmt(totalQty),                          color:"#16a34a"},
          {label:"Стоимость остатков",value:rub(totalValue),                      color:"#7c3aed"},
          {label:"Просрочено выдач", value:overdue.length,                        color:"#dc2626"},
        ].map((k,i)=>(
          <div key={i} style={{background:"white",borderRadius:8,padding:"14px 16px",border:"1px solid #e2e8f0",borderTop:`3px solid ${k.color}`}}>
            <div style={{fontSize:22,fontWeight:800,color:k.color}}>{k.value}</div>
            <div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12,marginBottom:12}}>
        <Card title="Последние операции">
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:"1px solid #f1f5f9"}}>
              {["Тип","Товар","Шт","Кто отдал","Получатель","Дата"].map(h=><Th key={h}>{h}</Th>)}
            </tr></thead>
            <tbody>
              {recent.map(m=>(
                <tr key={m.id} style={{borderBottom:"1px solid #f8fafc"}}>
                  <td style={{padding:"6px 8px"}}><TypeBadge type={m.type}/></td>
                  <td style={{padding:"6px 8px",color:"#374151",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gp(m.productId)}</td>
                  <td style={{padding:"6px 8px",color:"#64748b",fontWeight:600}}>{m.qty}</td>
                  <td style={{padding:"6px 8px",color:"#64748b",fontSize:11}}>{m.issuerId?gu(m.issuerId):"—"}</td>
                  <td style={{padding:"6px 8px",color:"#64748b",fontSize:11}}>{m.recipientId?gu(m.recipientId):"—"}</td>
                  <td style={{padding:"6px 8px",color:"#9ca3af",fontSize:10,fontFamily:"monospace"}}>{m.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="⚠ Просроченные выдачи" titleColor="#dc2626">
          {overdue.length===0
            ? <div style={{padding:"22px 0",textAlign:"center",color:"#16a34a",fontSize:12}}>✓ Все в срок</div>
            : <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{borderBottom:"1px solid #fecaca"}}>
                  {["Получатель","Товар","Шт","Просрочка"].map(h=><Th key={h}>{h}</Th>)}
                </tr></thead>
                <tbody>
                  {overdue.map((c,i)=>{
                    const days=Math.floor((new Date()-new Date(c.dueDate))/86400000);
                    return (
                      <tr key={i} style={{borderBottom:"1px solid #fef2f2",background:"#fff8f8"}}>
                        <td style={{padding:"6px 8px",fontWeight:600,color:"#1e293b"}}>{gu(c.recipientId)}</td>
                        <td style={{padding:"6px 8px",color:"#374151",fontSize:11}}>{gp(c.productId)}</td>
                        <td style={{padding:"6px 8px",fontWeight:700}}>{c.remaining}</td>
                        <td style={{padding:"6px 8px",color:"#dc2626",fontWeight:700}}>+{days}д</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          }
        </Card>
      </div>

      <Card title="Выдано по филиалам">
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"4px 0"}}>
          {INIT_BRANCHES.map(b=>{
            const bOuts=activeCheckouts.filter(c=>c.branchId===b.id);
            const total=bOuts.reduce((a,c)=>a+c.remaining,0);
            const manager=INIT_USERS.find(u=>u.id===b.managerId);
            return (
              <div key={b.id} style={{background:"#f8fafc",borderRadius:6,padding:"12px 14px",border:"1px solid #e2e8f0"}}>
                <div style={{fontWeight:700,color:"#1e293b",fontSize:12}}>{b.name}</div>
                <div style={{fontSize:10,color:"#94a3b8"}}>{b.city}</div>
                <div style={{fontSize:10,color:"#64748b",marginTop:6}}>Рук: <span style={{fontWeight:600,color:"#374151"}}>{manager?.name||"—"}</span></div>
                <div style={{marginTop:8,display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontSize:22,fontWeight:800,color:total>0?"#2563eb":"#94a3b8"}}>{total}</span>
                  <span style={{fontSize:10,color:"#94a3b8"}}>ед. на руках</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
function Products({ products, stock, can, setProducts, addMov, gl }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({name:"",sku:"",category:"Одежда",price:CATEGORY_PRICES["Одежда"],locationId:4});
  const [qtyRow, setQtyRow]     = useState(null);
  const [filter, setFilter]     = useState("");

  const handleCat = cat => setForm(f=>({...f, category:cat, price:CATEGORY_PRICES[cat]||200}));

  const addProduct = () => {
    if (!form.name.trim()) return;
    const newId=Math.max(...products.map(p=>p.id))+1;
    setProducts(p=>[...p,{...form,id:newId,price:Number(form.price)||CATEGORY_PRICES[form.category],locationId:Number(form.locationId),archived:false}]);
    setShowForm(false);
    setForm({name:"",sku:"",category:"Одежда",price:CATEGORY_PRICES["Одежда"],locationId:4});
  };

  const doReceive = p => {
    addMov({type:"in",productId:p.id,qty:qtyRow.qty,locationId:p.locationId,issuerId:1,date:TODAY,notes:"Приход товара"});
    setQtyRow(null);
  };

  const filtered=products.filter(p=>!p.archived&&(
    p.name.toLowerCase().includes(filter.toLowerCase())||p.sku.toLowerCase().includes(filter.toLowerCase())
  ));

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Поиск по названию или артикулу..." style={{...IS,flex:1}}/>
        {can("edit")&&<Btn color="#2563eb" onClick={()=>setShowForm(!showForm)}>+ Добавить товар</Btn>}
      </div>

      {showForm&&can("edit")&&(
        <Card title="Новый товар" style={{marginBottom:12,borderTop:"2px solid #2563eb"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:10}}>
            <Field label="Название">
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={IS} placeholder="Название товара"/>
            </Field>
            <Field label="Артикул">
              <input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} style={IS} placeholder="SKU-001"/>
            </Field>
            <Field label="Категория">
              <select value={form.category} onChange={e=>handleCat(e.target.value)} style={IS}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Цена ₽ (авто по категории)">
              <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={IS}/>
            </Field>
            <Field label="Место хранения">
              <select value={form.locationId} onChange={e=>setForm({...form,locationId:Number(e.target.value)})} style={IS}>
                {INIT_LOCATIONS.filter(l=>l.type==="section").map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
          </div>
          <div style={{marginTop:10,fontSize:11,color:"#94a3b8",marginBottom:8}}>
            💡 Цена подставляется автоматически при выборе категории. Вы можете изменить её вручную.
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn color="#16a34a" onClick={addProduct}>Сохранить</Btn>
            <Btn color="#64748b" onClick={()=>setShowForm(false)}>Отмена</Btn>
          </div>
        </Card>
      )}

      <Card>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
            {["Артикул","Название","Категория","Цена","Место","Остаток","Стоимость",""].map(h=><Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fafafa":"white"}}>
                <td style={{padding:"9px 10px",color:"#94a3b8",fontFamily:"monospace",fontSize:11}}>{p.sku}</td>
                <td style={{padding:"9px 10px",color:"#1e293b",fontWeight:600}}>{p.name}</td>
                <td style={{padding:"9px 10px"}}><Pill color="#f1f5f9" text="#64748b">{p.category}</Pill></td>
                <td style={{padding:"9px 10px",color:"#374151",fontWeight:600}}>{rub(p.price)}</td>
                <td style={{padding:"9px 10px",color:"#64748b",fontSize:11}}>{gl(p.locationId)}</td>
                <td style={{padding:"9px 10px"}}>
                  <span style={{fontWeight:700,fontSize:14,color:(stock[p.id]||0)<5?"#dc2626":"#16a34a"}}>{stock[p.id]||0}</span>
                  <span style={{color:"#94a3b8",fontSize:10}}> шт</span>
                </td>
                <td style={{padding:"9px 10px",color:"#374151",fontSize:11,fontWeight:500}}>{rub((stock[p.id]||0)*p.price)}</td>
                <td style={{padding:"9px 10px"}}>
                  {can("edit")&&(
                    qtyRow?.productId===p.id
                      ? <span style={{display:"flex",gap:4,alignItems:"center"}}>
                          <input type="number" min={1} value={qtyRow.qty} onChange={e=>setQtyRow({...qtyRow,qty:Number(e.target.value)})}
                            style={{...IS,width:60,padding:"4px 7px"}}/>
                          <Btn color="#16a34a" small onClick={()=>doReceive(p)}>✓</Btn>
                          <Btn color="#64748b" small onClick={()=>setQtyRow(null)}>✕</Btn>
                        </span>
                      : <Btn color="#f0fdf4" textColor="#16a34a" small onClick={()=>setQtyRow({productId:p.id,qty:10})}>+ Приход</Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ОСТАТКИ ─────────────────────────────────────────────────────────────────
function StockView({ products, stock }) {
  const [groupBy, setGroupBy] = useState("category");

  const byCat = CATEGORIES.map(cat=>{
    const ps=products.filter(p=>!p.archived&&p.category===cat);
    return {name:cat, items:ps.map(p=>({...p,qty:stock[p.id]||0,value:(stock[p.id]||0)*p.price})),
      total:ps.reduce((a,p)=>a+(stock[p.id]||0),0),
      totalValue:ps.reduce((a,p)=>a+(stock[p.id]||0)*p.price,0)};
  }).filter(g=>g.items.length>0);

  const byLoc = INIT_LOCATIONS.filter(l=>l.type==="section").map(loc=>{
    const ps=products.filter(p=>!p.archived&&p.locationId===loc.id);
    return {name:loc.name, items:ps.map(p=>({...p,qty:stock[p.id]||0,value:(stock[p.id]||0)*p.price})),
      total:ps.reduce((a,p)=>a+(stock[p.id]||0),0),
      totalValue:ps.reduce((a,p)=>a+(stock[p.id]||0)*p.price,0)};
  }).filter(g=>g.items.length>0);

  const groups = groupBy==="category"?byCat:byLoc;
  const grandVal = products.reduce((a,p)=>a+(stock[p.id]||0)*p.price,0);
  const grandQty = Object.values(stock).reduce((a,b)=>a+b,0);

  return (
    <div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:12,color:"#64748b"}}>Группировать:</span>
        {[["category","По категории"],["location","По месту хранения"]].map(([v,l])=>(
          <button key={v} onClick={()=>setGroupBy(v)} style={{padding:"6px 12px",borderRadius:5,border:"1px solid #e2e8f0",
            fontSize:11,cursor:"pointer",background:groupBy===v?"#2563eb":"white",
            color:groupBy===v?"white":"#64748b",fontWeight:groupBy===v?600:400}}>
            {l}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:10}}>
          <div style={{background:"#f0fdf4",padding:"7px 14px",borderRadius:6,fontSize:12,fontWeight:700,color:"#16a34a"}}>{fmt(grandQty)} шт</div>
          <div style={{background:"#eff6ff",padding:"7px 14px",borderRadius:6,fontSize:12,fontWeight:700,color:"#2563eb"}}>{rub(grandVal)}</div>
        </div>
      </div>

      {groups.map(g=>(
        <Card key={g.name} title={`${g.name} — ${fmt(g.total)} шт · ${rub(g.totalValue)}`} style={{marginBottom:10}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{borderBottom:"1px solid #f1f5f9"}}>
              {["Артикул","Название","Цена","Кол-во","Стоимость","Статус"].map(h=><Th key={h}>{h}</Th>)}
            </tr></thead>
            <tbody>
              {g.items.map((p,i)=>(
                <tr key={p.id} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fafafa":"white"}}>
                  <td style={{padding:"8px 10px",color:"#94a3b8",fontFamily:"monospace",fontSize:10}}>{p.sku}</td>
                  <td style={{padding:"8px 10px",color:"#1e293b",fontWeight:500}}>{p.name}</td>
                  <td style={{padding:"8px 10px",color:"#374151"}}>{rub(p.price)}</td>
                  <td style={{padding:"8px 10px",fontWeight:700,fontSize:14,
                    color:p.qty===0?"#dc2626":p.qty<5?"#d97706":p.qty<20?"#ca8a04":"#1e293b"}}>{p.qty}</td>
                  <td style={{padding:"8px 10px",fontWeight:600,color:"#374151"}}>{rub(p.value)}</td>
                  <td style={{padding:"8px 10px"}}>
                    {p.qty===0?<Pill color="#fef2f2" text="#dc2626">Нет</Pill>
                    :p.qty<5?<Pill color="#fff7ed" text="#c2410c">Заканчивается</Pill>
                    :<Pill color="#f0fdf4" text="#16a34a">В наличии</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}

// ─── ДВИЖЕНИЯ ────────────────────────────────────────────────────────────────
function MovementsView({ products, can, addMov, movements, gp, gu, gb, currentUser }) {
  const empty = {type:"out",productId:1,qty:1,issuerId:currentUser.id,recipientId:2,branchId:1,purpose:"",dueDate:"",condition:"хорошее",notes:""};
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState("");

  const open = type => { setForm({...empty,type,issuerId:currentUser.id}); setShow(true); };

  const submit = () => {
    addMov({...form,productId:Number(form.productId),qty:Number(form.qty),
      issuerId:Number(form.issuerId),recipientId:Number(form.recipientId),branchId:Number(form.branchId),
      locationId:products.find(p=>p.id===Number(form.productId))?.locationId,date:TODAY});
    setShow(false);
  };

  const sorted=[...movements]
    .filter(m=>!filter||(gp(m.productId)+gu(m.issuerId)+gu(m.recipientId)+(m.purpose||"")).toLowerCase().includes(filter.toLowerCase()))
    .sort((a,b)=>b.date.localeCompare(a.date));

  const OPS=[
    {type:"out",     label:"↑ Выдать",       color:"#2563eb"},
    {type:"return",  label:"↓ Принять возврат",color:"#7c3aed"},
    {type:"writeoff",label:"✕ Списать",       color:"#dc2626"},
    {type:"in",      label:"+ Приход",        color:"#16a34a"},
  ];

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        {can("move")&&OPS.map(op=><Btn key={op.type} color={op.color} onClick={()=>open(op.type)}>{op.label}</Btn>)}
        <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Поиск..." style={{...IS,width:200,marginLeft:"auto"}}/>
      </div>

      {show&&(
        <Card title={TYPE_LABEL[form.type]} style={{marginBottom:12,borderTop:`2px solid ${TYPE_COLOR[form.type]}`}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            <Field label="Товар">
              <select value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})} style={IS}>
                {products.filter(p=>!p.archived).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Количество">
              <input type="number" min={1} value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={IS}/>
            </Field>
            <Field label="Кто отдаёт (исполнитель)">
              <select value={form.issuerId} onChange={e=>setForm({...form,issuerId:e.target.value})} style={IS}>
                {INIT_USERS.filter(u=>u.role==="admin"||u.role==="manager").map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
            {(form.type==="out"||form.type==="return")&&<>
              <Field label={form.type==="out"?"Получатель (кому)":"Возврат от (кто)"}>
                <select value={form.recipientId} onChange={e=>setForm({...form,recipientId:e.target.value})} style={IS}>
                  {INIT_USERS.map(u=><option key={u.id} value={u.id}>{u.name} ({ROLES[u.role]})</option>)}
                </select>
              </Field>
              <Field label="Филиал">
                <select value={form.branchId} onChange={e=>setForm({...form,branchId:e.target.value})} style={IS}>
                  {INIT_BRANCHES.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            </>}
            {form.type==="out"&&<>
              <Field label="Цель / мероприятие">
                <input value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} placeholder="Конференция, выставка..." style={IS}/>
              </Field>
              <Field label="Вернуть до">
                <input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} style={IS}/>
              </Field>
            </>}
            {form.type==="return"&&
              <Field label="Состояние товара">
                <select value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})} style={IS}>
                  <option value="хорошее">Хорошее</option>
                  <option value="б/у">Б/у</option>
                  <option value="брак">Брак</option>
                </select>
              </Field>
            }
            <Field label="Примечание">
              <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={IS}/>
            </Field>
          </div>
          <div style={{marginTop:10,display:"flex",gap:8}}>
            <Btn color={TYPE_COLOR[form.type]} onClick={submit}>Сохранить</Btn>
            <Btn color="#64748b" onClick={()=>setShow(false)}>Отмена</Btn>
          </div>
        </Card>
      )}

      <Card>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
            {["Дата","Тип","Товар","Шт","Кто отдал","Получатель","Филиал","Цель / Примечание"].map(h=><Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {sorted.map((m,i)=>(
              <tr key={m.id} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fafafa":"white"}}>
                <td style={{padding:"8px 10px",color:"#9ca3af",fontSize:10,fontFamily:"monospace"}}>{m.date}</td>
                <td style={{padding:"8px 10px"}}><TypeBadge type={m.type}/></td>
                <td style={{padding:"8px 10px",color:"#1e293b",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{gp(m.productId)}</td>
                <td style={{padding:"8px 10px",fontWeight:700,color:"#374151"}}>×{m.qty}</td>
                <td style={{padding:"8px 10px",color:"#64748b",fontSize:11}}>{m.issuerId?gu(m.issuerId):"—"}</td>
                <td style={{padding:"8px 10px",color:"#64748b",fontSize:11}}>{m.recipientId?gu(m.recipientId):"—"}</td>
                <td style={{padding:"8px 10px"}}>{m.branchId?<Pill color="#eff6ff" text="#3b82f6">{gb(m.branchId)}</Pill>:<span style={{color:"#94a3b8"}}>—</span>}</td>
                <td style={{padding:"8px 10px",color:"#94a3b8",fontSize:11}}>{m.purpose||m.notes||(m.condition?`Состояние: ${m.condition}`:"—")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ДОЛЖНИКИ ────────────────────────────────────────────────────────────────
function Debtors({ activeCheckouts, overdue, gp, gu, gb, products }) {
  return (
    <div>
      {overdue.length>0&&(
        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,padding:"10px 14px",marginBottom:12,fontSize:12,color:"#dc2626",fontWeight:500}}>
          ⚠ Просрочено {overdue.length} выдач — свяжитесь с сотрудниками
        </div>
      )}
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
            {["Получатель","Филиал","Товар","Шт","Сумма","Кто выдал","Выдано","Вернуть до","Статус","Цель"].map(h=><Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {activeCheckouts.length===0
              ? <tr><td colSpan={10} style={{padding:28,textAlign:"center",color:"#94a3b8"}}>Все товары на складе ✓</td></tr>
              : activeCheckouts.map((c,i)=>{
                  const isOD=c.dueDate&&c.dueDate<TODAY;
                  const days=c.dueDate?Math.floor((new Date()-new Date(c.dueDate))/86400000):null;
                  const price=products.find(p=>p.id===c.productId)?.price||0;
                  return (
                    <tr key={i} style={{borderBottom:"1px solid #f8fafc",background:isOD?"#fff8f8":i%2?"#fafafa":"white"}}>
                      <td style={{padding:"8px 10px",fontWeight:600,color:"#1e293b"}}>{gu(c.recipientId)}</td>
                      <td style={{padding:"8px 10px"}}>{c.branchId?<Pill color="#eff6ff" text="#3b82f6">{gb(c.branchId)}</Pill>:"—"}</td>
                      <td style={{padding:"8px 10px",color:"#374151"}}>{gp(c.productId)}</td>
                      <td style={{padding:"8px 10px",fontWeight:700}}>{c.remaining}</td>
                      <td style={{padding:"8px 10px",color:"#374151",fontSize:11,fontWeight:500}}>{rub(c.remaining*price)}</td>
                      <td style={{padding:"8px 10px",color:"#64748b",fontSize:11}}>{c.issuerId?gu(c.issuerId):"—"}</td>
                      <td style={{padding:"8px 10px",color:"#64748b",fontSize:10,fontFamily:"monospace"}}>{c.date}</td>
                      <td style={{padding:"8px 10px",color:"#64748b",fontSize:10,fontFamily:"monospace"}}>{c.dueDate||"—"}</td>
                      <td style={{padding:"8px 10px"}}>
                        {isOD?<Pill color="#fef2f2" text="#dc2626">+{days} дн</Pill>:<Pill color="#f0fdf4" text="#16a34a">В срок</Pill>}
                      </td>
                      <td style={{padding:"8px 10px",color:"#94a3b8",fontSize:11}}>{c.purpose||"—"}</td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ФИЛИАЛЫ ─────────────────────────────────────────────────────────────────
function Branches({ activeCheckouts, gp, gu }) {
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {INIT_BRANCHES.map(b=>{
          const manager=INIT_USERS.find(u=>u.id===b.managerId);
          const employees=INIT_USERS.filter(u=>u.branchId===b.id);
          const bOuts=activeCheckouts.filter(c=>c.branchId===b.id);
          const totalQty=bOuts.reduce((a,c)=>a+c.remaining,0);
          return (
            <Card key={b.id} title="" style={{borderTop:"2px solid #2563eb"}}>
              <div style={{padding:"14px 14px 8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight:700,color:"#1e293b",fontSize:14}}>{b.name}</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:1}}>{b.city}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:26,fontWeight:800,color:totalQty>0?"#2563eb":"#94a3b8"}}>{totalQty}</div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>ед. на руках</div>
                  </div>
                </div>
                <div style={{marginTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  <div style={{background:"#f8fafc",borderRadius:5,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:"#94a3b8",marginBottom:3}}>РУКОВОДИТЕЛЬ</div>
                    <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>{manager?.name||"—"}</div>
                    <RoleBadge role={manager?.role}/>
                  </div>
                  <div style={{background:"#f8fafc",borderRadius:5,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:"#94a3b8",marginBottom:3}}>СОТРУДНИКОВ</div>
                    <div style={{fontSize:20,fontWeight:700,color:"#374151"}}>{employees.length}</div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>человек</div>
                  </div>
                </div>
              </div>
              {bOuts.length>0&&(
                <div style={{borderTop:"1px solid #f1f5f9"}}>
                  <div style={{padding:"8px 14px 4px",fontSize:10,color:"#94a3b8",fontWeight:600}}>ТЕКУЩИЕ ВЫДАЧИ</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                    <thead><tr style={{borderBottom:"1px solid #f1f5f9"}}>
                      {["Сотрудник","Товар","Шт","Выдано"].map(h=><Th key={h}>{h}</Th>)}
                    </tr></thead>
                    <tbody>
                      {bOuts.map((c,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                          <td style={{padding:"5px 10px",color:"#374151",fontWeight:500}}>{gu(c.recipientId)}</td>
                          <td style={{padding:"5px 10px",color:"#64748b"}}>{gp(c.productId)}</td>
                          <td style={{padding:"5px 10px",fontWeight:700,color:"#2563eb"}}>{c.remaining}</td>
                          <td style={{padding:"5px 10px",color:"#9ca3af",fontFamily:"monospace",fontSize:10}}>{c.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {bOuts.length===0&&<div style={{padding:"8px 14px 12px",color:"#94a3b8",fontSize:11}}>Активных выдач нет</div>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── ОТЧЁТЫ ──────────────────────────────────────────────────────────────────
function Reports({ movements, products, stock }) {
  const rows = products.filter(p=>!p.archived).map(p=>({
    ...p,
    inQty:       movements.filter(m=>m.type==="in"&&m.productId===p.id).reduce((a,m)=>a+m.qty,0),
    outQty:      movements.filter(m=>m.type==="out"&&m.productId===p.id).reduce((a,m)=>a+m.qty,0),
    returnQty:   movements.filter(m=>m.type==="return"&&m.productId===p.id).reduce((a,m)=>a+m.qty,0),
    writeoffQty: movements.filter(m=>m.type==="writeoff"&&m.productId===p.id).reduce((a,m)=>a+m.qty,0),
    qty:  stock[p.id]||0,
    value:(stock[p.id]||0)*p.price,
  })).sort((a,b)=>b.outQty-a.outQty);

  const totalVal = rows.reduce((a,r)=>a+r.value,0);

  const exportCSV = () => {
    const csv=["Артикул,Название,Категория,Цена,Приход,Выдано,Возврат,Списано,Остаток,Стоимость",
      ...rows.map(p=>`${p.sku},"${p.name}",${p.category},${p.price},${p.inQty},${p.outQty},${p.returnQty},${p.writeoffQty},${p.qty},${p.value}`)
    ].join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
    a.download=`отчёт_склад_${TODAY}.csv`; a.click();
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{background:"#eff6ff",borderRadius:7,padding:"10px 16px",fontSize:13,fontWeight:700,color:"#2563eb"}}>
          Суммарная стоимость остатков: {rub(totalVal)}
        </div>
        <Btn color="#1e293b" onClick={exportCSV}>↓ Экспорт CSV</Btn>
      </div>
      <Card>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
            {["Артикул","Название","Категория","Цена","Приход","Выдано","Возврат","Списано","Остаток","Стоимость"].map(h=><Th key={h}>{h}</Th>)}
          </tr></thead>
          <tbody>
            {rows.map((p,i)=>(
              <tr key={p.id} style={{borderBottom:"1px solid #f8fafc",background:i%2?"#fafafa":"white"}}>
                <td style={{padding:"8px 10px",color:"#94a3b8",fontFamily:"monospace",fontSize:10}}>{p.sku}</td>
                <td style={{padding:"8px 10px",color:"#1e293b",fontWeight:600}}>{p.name}</td>
                <td style={{padding:"8px 10px"}}><Pill color="#f1f5f9" text="#64748b">{p.category}</Pill></td>
                <td style={{padding:"8px 10px",color:"#374151"}}>{rub(p.price)}</td>
                <td style={{padding:"8px 10px",color:"#16a34a",fontWeight:700}}>{p.inQty}</td>
                <td style={{padding:"8px 10px",color:"#2563eb",fontWeight:700}}>{p.outQty}</td>
                <td style={{padding:"8px 10px",color:"#7c3aed",fontWeight:700}}>{p.returnQty}</td>
                <td style={{padding:"8px 10px",color:"#dc2626",fontWeight:700}}>{p.writeoffQty}</td>
                <td style={{padding:"8px 10px",fontWeight:700,fontSize:14,color:p.qty<5?"#dc2626":"#1e293b"}}>{p.qty}</td>
                <td style={{padding:"8px 10px",fontWeight:600,color:"#374151"}}>{rub(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── UI-КОМПОНЕНТЫ ───────────────────────────────────────────────────────────
function Card({ children, title, titleColor="#374151", style={} }) {
  return (
    <div style={{background:"white",borderRadius:8,border:"1px solid #e2e8f0",overflow:"hidden",...style}}>
      {title&&<div style={{padding:"10px 14px",borderBottom:"1px solid #f1f5f9",fontSize:11,fontWeight:700,color:titleColor}}>{title}</div>}
      <div>{children}</div>
    </div>
  );
}

function Th({ children }) {
  return <th style={{padding:"7px 10px",textAlign:"left",fontSize:10,color:"#94a3b8",fontWeight:600,letterSpacing:0.3,whiteSpace:"nowrap"}}>{children}</th>;
}

function TypeBadge({ type }) {
  return <span style={{background:TYPE_BG[type],color:TYPE_COLOR[type],padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:600}}>{TYPE_LABEL[type]}</span>;
}

function Pill({ color, text, children }) {
  return <span style={{background:color,color:text,padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>;
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{fontSize:10,color:"#94a3b8",display:"block",marginBottom:4}}>{label}</label>
      {children}
    </div>
  );
}

function Btn({ color, textColor="#fff", children, onClick, small=false }) {
  return (
    <button onClick={onClick} style={{background:color,color:textColor,border:"none",
      padding:small?"4px 10px":"7px 14px",borderRadius:5,fontSize:small?10:11,
      cursor:"pointer",fontWeight:600,whiteSpace:"nowrap",letterSpacing:0.2}}>
      {children}
    </button>
  );
}

function RoleBadge({ role }) {
  const colors = {admin:["#fef3c7","#92400e"],director:["#ede9fe","#5b21b6"],manager:["#e0f2fe","#075985"],employee:["#f0fdf4","#166534"]};
  const [bg,text] = colors[role]||["#f1f5f9","#475569"];
  return <span style={{fontSize:9,background:bg,color:text,padding:"2px 6px",borderRadius:3,fontWeight:600,marginTop:3,display:"inline-block"}}>{ROLES[role]||"—"}</span>;
}

const IS = {width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:5,
  fontSize:12,background:"white",color:"#1e293b",boxSizing:"border-box",outline:"none"};
