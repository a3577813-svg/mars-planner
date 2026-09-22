export type SeniorPlannerItem={
  n:number;
  title:string;
  kind:"shared"|"ready";
  source?:number;
};

export const seniorTitles:Record<number,string>={
  1:"Моя экспедиция к идее",
  2:"Сканирование локации",
  3:"Моё состояние и впечатления",
  4:"Путевой лист экспедиции: Никола-Ленивец",
  5:"Рефлексия экспедиции «Никола-Ленивец»",
  6:"Штаб-квартира проекта",
  7:"Карта знаний и дефицитов",
  8:"От Ленивца до Абхазии",
  9:"План действий в поезде",
  10:"План пилотирования на МАРСфесте",
  11:"Разбор полётов. Абхазия",
  12:"Самые яркие открытия Абхазии",
  13:"Финальный план: МАРСфест завтра",
  14:"Проект в работе",
  15:"От МАРСфеста до Partners Day",
  16:"Подготовка к Partners Day",
  17:"Ответы на вопросы партнёров",
  18:"Экспедиционный отчёт: от идеи к презентации",
  19:"Командная динамика",
  20:"Моя экспедиция после Partners Day",
  21:"Сканирование локации после Partners Day",
  22:"Состояние и впечатления после проектного цикла",
  23:"Дорожная карта миссии",
  24:"Карта экспертов и партнёров",
  25:"Лист договорённостей с Partners Day",
  26:"Бюджет миссии и ресурсы",
  27:"Блок рисков и барьеров",
  28:"Мои заметки и расчёты",
  29:"Мои проекты: карта влияния",
  30:"Реализация и эффект",
  31:"Мотивационное письмо: конструктор",
  32:"Компетенции и доказательства",
  33:"Motivational Letter Guide",
  34:"Competencies and Evidence",
  35:"Cover Letter",
  36:"Cover Letter in English",
  37:"1,5 минуты авторства",
  38:"Самопрезентация: трудность и вывод",
  39:"My 90-Second Story",
  40:"Анализ цитаты и личная позиция",
  41:"Личная история как доказательство позиции",
  42:"My Quote. My Voice",
  43:"My Quote. My 3-Minute Video",
  44:"Моё путешествие в Великий Новгород",
  45:"Игра «Уездный город N»"
};

export const seniorItems:SeniorPlannerItem[]=Array.from(
  {length:45},
  (_,i)=>{
    const n=i+1;

    if(n<=28){
      return{n,title:seniorTitles[n],kind:"shared",source:n};
    }

    if(n===44){
      return{n,title:seniorTitles[n],kind:"shared",source:37};
    }

    if(n===45){
      return{n,title:seniorTitles[n],kind:"shared",source:38};
    }

    return{n,title:seniorTitles[n],kind:"ready"};
  }
);

export function seniorSharedHref(source:number){
  if(source<=12)return`/book?page=${source}&mode=student&senior=1`;
  if(source<=15)return`/book-next?page=${source}&mode=student&senior=1`;
  if(source<=18)return`/book-next2?page=${source}&mode=student&senior=1`;
  if(source<=21)return`/book-next3?page=${source}&mode=student&senior=1`;
  if(source<=24)return`/book-next4?page=${source}&mode=student&senior=1`;
  if(source<=27)return`/book-next5?page=${source}&mode=student&senior=1`;
  if(source<=30)return`/book-next6?page=${source}&mode=student&senior=1`;
  if(source<=33)return`/book-next7?page=${source}&mode=student&senior=1`;
  if(source<=36)return`/book-next8?page=${source}&mode=student&senior=1`;
  return`/book-next9?page=${source}&mode=student&senior=1`;
}

export function seniorHref(item:SeniorPlannerItem){
  if(item.kind==="shared"){
    return seniorSharedHref(item.source!);
  }

  if(item.n<=31)return`/senior/unique?page=${item.n}`;
  if(item.n<=34)return`/senior/unique2?page=${item.n}`;
  if(item.n<=37)return`/senior/unique3?page=${item.n}`;
  if(item.n<=40)return`/senior/unique4?page=${item.n}`;

  return`/senior/unique5?page=${item.n}`;
}

export function seniorStoragePage(item:SeniorPlannerItem){
  return item.source??item.n;
}
