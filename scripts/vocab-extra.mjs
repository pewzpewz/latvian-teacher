/** Дополнительные слова для расширения словаря до 500+ */
export function batch(category, level, pairs) {
  return pairs.map(([lv, ru]) => ({ lv, ru, category, level }))
}

export const EXTRA_BATCHES = [
  ...batch('Животные', 'A1', [
    ['sun', 'собака'], ['kaķis', 'кот'], ['putns', 'птица'], ['zivs', 'рыба'],
    ['zirgs', 'лошадь'], ['govs', 'корова'], ['cūka', 'свинья'], ['aita', 'овца'],
    ['vista', 'курица'], ['lapsa', 'лиса'], ['lācis', 'медведь'], ['vilks', 'волк'],
    ['zaķis', 'заяц'], ['ezis', 'ёж'], ['pīle', 'утка'], ['bišu', 'пчела'],
  ]),
  ...batch('Природа', 'A2', [
    ['koks', 'дерево'], ['zāle', 'трава'], ['zieds', 'цветок'], ['lapa', 'лист'],
    ['raga', 'скала'], ['smilts', 'песок'], ['akmens', 'камень'], ['dūmi', 'дым'],
    ['migla', 'туман'], ['varavīksne', 'радуга'], ['ātri', 'молния'], ['pērkons', 'гром'],
    ['plūdi', 'наводнение'], ['sausa', 'засуха'], ['krasts', 'берег'], ['sala', 'остров'],
  ]),
  ...batch('Погода', 'A1', [
    ['laiks', 'погода'], ['silts', 'тёплый'], ['mākoņi', 'облака'],
    ['spīd', 'светит'], [' līst', 'идёт дождь'], [' snieg', 'идёт снег'],
  ].map(([lv, ru]) => [lv.trim(), ru])),
  ...batch('Эмоции', 'A1', [
    ['laimīgs', 'счастливый'], ['bēdīgs', 'грустный'], ['dusmīgs', 'злой'],
    ['nobijies', 'испуганный'], ['pārsteigts', 'удивлённый'], ['garlaicīgs', 'скучающий'],
    ['mierīgs', 'спокойный'], ['nervozs', 'нервный'], ['pārliecināts', 'уверенный'],
    ['kauns', 'стыд'], ['prieks', 'радость'], ['bailes', 'страх'],
  ]),
  ...batch('Школа', 'A1', [
    ['skola', 'школа'], ['klase', 'класс'], ['grāmata', 'учебник'], ['zīmulis', 'карандаш'],
    ['pildspalva', 'ручка'], ['burtnīca', 'тетрадь'], ['tāfele', 'доска'], ['eksāmens', 'экзамен'],
    ['mājasdarbs', 'домашнее задание'], ['stunda', 'урок'], ['pauze', 'перемена'],
    ['zināšanas', 'знания'], ['jautājums', 'вопрос'], ['atbilde', 'ответ'],
  ]),
  ...batch('Путешествия', 'A2', [
    ['viesnīca', 'отель'], ['rezervācija', 'бронирование'], ['biļete', 'билет'],
    ['ceļš', 'дорога'], ['karte', 'карта'], ['ceļvedis', 'гид'], ['tūrists', 'турист'],
    ['muita', 'таможня'], ['robeža', 'граница'], ['pase', 'паспорт'], ['bagāža', 'багаж'],
    ['aizkavēšanās', 'задержка'], ['izbraukšana', 'отправление'], ['ienākšana', 'прибытие'],
  ]),
  ...batch('Покупки', 'A1', [
    ['cena', 'цена'], ['maksāt', 'платить'], ['kase', 'касса'], ['čeks', 'чек'],
    ['dāvana', 'подарок'], ['prece', 'товар'], ['izvēle', 'выбор'], ['izmērs', 'размер'],
    ['svars', 'вес'], ['gabals', 'штука'], ['pārdevējs', 'продавец'], ['pircējs', 'покупатель'],
  ]),
  ...batch('Глаголы', 'A1', [
    ['nākt', 'приходить'], ['iet', 'идти'], ['braukt', 'ехать'], ['lidot', 'летать'],
    ['swim', 'плавать'], ['lēkt', 'прыгать'], ['sēdēt', 'сидеть'], ['stāvēt', 'стоять'],
    ['skriet', 'бегать'], ['dejot', 'танцевать'], ['dziedāt', 'петь'], ['spēlēt', 'играть'],
    ['smieties', 'смеяться'], ['raudāt', 'плакать'], ['meklēt', 'искать'], ['atrast', 'найти'],
    ['dot', 'давать'], ['ņemt', 'брать'], ['atvērt', 'открывать'], ['aizvērt', 'закрывать'],
    ['sākt', 'начинать'], ['beigt', 'заканчивать'], ['palīdzēt', 'помогать'], ['gaidīt', 'ждать'],
  ].map(([lv, ru]) => (lv === 'swim' ? ['peldēt', ru] : [lv, ru]))),
  ...batch('Глаголы', 'A2', [
    ['izlemt', 'решить'], ['izvēlēties', 'выбрать'], ['piedāvāt', 'предложить'],
    ['pieņemt', 'принять'], ['noraidīt', 'отклонить'], ['paskaidrot', 'объяснить'],
    ['aprakstīt', 'описать'], ['salīdzināt', 'сравнить'], ['izmantot', 'использовать'],
    ['uzlabot', 'улучшить'], ['pasliktināt', 'ухудшить'], ['aizstāt', 'заменить'],
  ]),
  ...batch('Прилагательные', 'A1', [
    ['svarīgs', 'важный'], ['nepieciešams', 'необходимый'], ['iespējams', 'возможный'],
    ['neiespējams', 'невозможный'], ['pareizs', 'правильный'], ['nepareizs', 'неправильный'],
    ['interesants', 'интересный'], ['garlaicīgs', 'скучный'], ['grūts', 'трудный'],
    ['viegls', 'лёгкий'], ['dārgs', 'дорогой'], ['lēts', 'дешёвый'], ['tīrs', 'чистый'],
    ['netīrs', 'грязный'], ['pilns', 'полный'], ['tukšs', 'пустой'],
  ]),
  ...batch('Прилагательные', 'A2', [
    ['nacionāls', 'национальный'], ['starptautisks', 'международный'], ['oficiāls', 'официальный'],
    ['neoficiāls', 'неофициальный'], ['tradicionāls', 'традиционный'], ['moderns', 'современный'],
    ['dabīgs', 'натуральный'], ['mākslīgs', 'искусственный'], ['piemērots', 'подходящий'],
  ]),
  ...batch('Связки', 'A2', [
    ['un', 'и'], ['bet', 'но'], ['vai', 'или'], ['jo', 'потому что'],
    ['tāpēc', 'поэтому'], ['ja', 'если'], ['kad', 'когда'], ['lai', 'чтобы'],
    ['līdz', 'до'], ['pēc', 'после'], ['pirms', 'до/перед'], ['starp', 'между'],
    ['virs', 'над'], ['zem', 'под'], ['aiz', 'за'], ['priekš', 'для'],
  ]),
  ...batch('Время', 'A2', [
    ['agrāk', 'раньше'], ['vēlāk', 'позже'], ['tagad', 'сейчас'], ['tad', 'тогда'],
    ['nekad', 'никогда'], ['vienmēr', 'всегда'], ['bieži', 'часто'], ['reti', 'редко'],
    ['dažreiz', 'иногда'], ['atkal', 'снова'], ['jau', 'уже'], ['vēl', 'ещё'],
    ['tikko', 'только что'], ['drīz', 'скоро'], ['ilgi', 'долго'],
  ]),
  ...batch('Тело', 'A1', [
    ['mati', 'волосы'], ['seja', 'лицо'], ['deguns', 'нос'], ['mute', 'рот'],
    ['zobs', 'зуб'], ['mēle', 'язык'], ['kakls', 'шея'], ['plecs', 'плечо'],
    ['pirksts', 'палец'], ['nags', 'ноготь'], ['krūtis', 'грудь'], ['mugura', 'спина'],
    ['vēders', 'живот'], ['kauls', 'кость'], ['āda', 'кожа'],
  ]),
  ...batch('Здоровье', 'A2', [
    ['vakcīna', 'вакцина'], ['operācija', 'операция'], ['rehabilitācija', 'реабилитация'],
    ['alergija', 'аллергия'], ['ievainojums', 'травма'], ['recepte', 'рецепт'],
    ['analīzes', 'анalyses'], ['asins', 'кровь'], ['elpošana', 'дыхание'],
  ].map(([lv, ru]) => (lv === 'analīzes' ? ['analīze', 'анализ'] : lv === 'asins' ? ['asinis', 'кровь'] : [lv, ru]))),
  ...batch('Работа', 'A2', [
    ['uzņēmums', 'предприятие'], ['fabrika', 'фабрика'], ['rūpnīca', 'завод'],
    ['darba devējs', 'работодатель'], ['darba ņēmējs', 'работник'], ['līgums', 'договор'],
    ['pieteikums', 'заявление'], ['intervija', 'собеседование'], ['prakse', 'практика'],
    ['pensija', 'пенсия'], ['bezdarbs', 'безработица'], ['darbavietas', 'рабочие места'],
  ]),
  ...batch('Дом', 'A1', [
    ['dīvāns', 'диван'], ['spilvens', 'подушка'], ['segas', 'одеяло'], ['aizkars', 'штора'],
    ['spogulis', 'зеркало'], ['lampa', 'лампа'], ['atslēga', 'ключ'], ['durvis', 'дверь'],
    ['logs', 'окно'], ['siena', 'стена'], ['grīda', 'пол'], ['jumts', 'крыша'],
  ].map(([lv, ru]) => (lv === 'segas' ? ['sega', 'одеяло'] : [lv, ru]))),
  ...batch('Еда', 'A1', [
    ['ābols', 'яблоко'], ['banāns', 'банан'], ['apelsīns', 'апельсин'], ['cukurs', 'сugar'],
    ['sāls', 'соль'], ['pipars', 'перец'], ['sviests', 'масло'], ['medus', 'мёд'],
    ['cepums', 'печенье'], ['kūka', 'торт'], ['zupa', 'суп'], ['gaļas', 'бульон'],
  ].map(([lv, ru]) => {
    if (lv === 'cukurs') return ['cukurs', 'сахар']
    if (lv === 'gaļas') return ['buljons', 'бульон']
    return [lv, ru]
  })),
  ...batch('Еда', 'A2', [
    ['brokolis', 'брокколи'], ['burkāns', 'морковь'], ['ķiploks', 'чеснок'], ['sīpols', 'лук'],
    ['gurķis', 'огурец'], ['tomāts', 'помидор'], ['paprika', 'перец болгарский'],
    ['mērce', 'соус'], ['garšvielas', 'специи'], ['recepte', 'рецепт'],
  ]),
  ...batch('Город', 'A2', [
    ['centrs', 'центр'], ['priekšpilsēta', 'пригород'], ['iela', 'улица'], ['laukums', 'площадь'],
    ['tilts', 'мост'], ['tunelis', 'тоннель'], [' luksofor', 'светофор'], ['stāvvieta', 'парковка'],
    ['metro', 'метро'], ['tramvajs', 'трамвай'], ['vilciens', 'поезд'], ['taksometrs', 'такси'],
  ].map(([lv, ru]) => (lv.trim() === 'luksofor' ? ['luksofor', ru] : [lv.trim(), ru]))),
  ...batch('Культура', 'A2', [
    ['svētki', 'праздник'], ['tradīcija', 'т tradition'], ['tautas', 'народный'],
    ['deja', 'танец'], ['dziesma', 'песня'], ['teātris', 'театр'], ['izstāde', 'выставка'],
    ['muzejs', 'музей'], ['piemineklis', 'памятник'], ['karogs', 'флаг'], ['himna', 'гимн'],
  ].map(([lv, ru]) => {
    if (lv === 'tradīcija') return ['tradīcija', 'традиция']
    if (lv === 'tautas') return ['tautas deja', 'народный танец']
    return [lv, ru]
  })),
  ...batch('Культура', 'A1', [
    ['Jāņi', 'Лиго (Jāņi)'], ['Lieldienas', 'Пасха'], ['Ziemassvētki', 'Рождество'],
    ['Neatkarības diena', 'День независимости'], ['dzimšanas diena', 'день рождения'],
  ]),
  ...batch('Досуг', 'A2', [
    ['hokejs', 'хоккей'], ['teniss', 'теннис'], ['peldēšana', 'плавание'],
    ['pastaiga', 'прогулка'], ['pikniks', 'пикник'], ['koncerts', 'концерт'],
    ['izrāde', 'спектакль'], ['hobijs', 'хобби'], ['fotografēšana', 'фотография'],
  ]),
  ...batch('Технологии', 'A2', [
    ['programma', 'программа'], ['lietotne', 'приложение'], ['ekrāns', 'экран'],
    ['klaviatūra', 'клавиатура'], ['pele', 'мышь'], ['drukāšana', 'печать'],
    ['datne', 'файл'], ['mākonis', 'облако (IT)'], ['drošība', 'безопасность'],
    ['hakeris', 'хакер'], ['vīrus', 'вирус'], ['atjauninājums', 'обновление'],
  ]),
  ...batch('Общество', 'B1', [
    ['demokrātija', 'демократия'], ['parlaments', 'парламент'], ['prezidents', 'президент'],
    ['ministrs', 'министр'], ['vēlēšanas', 'выборы'], ['balsošana', 'голосование'],
    ['pilsonība', 'гражданство'], ['nacionālā', 'национальная идентичность'],
    ['integrācija', 'интеграция'], ['diskriminācija', 'дискриминация'], ['toleranc', 'терпимость'],
  ].map(([lv, ru]) => {
    if (lv === 'nacionālā') return ['identitāte', 'идентичность']
    if (lv === 'toleranc') return ['toleranc', 'терпимость']
    return [lv, ru]
  })),
  ...batch('Общество', 'B1', [
    ['tolerance', 'терпимость'], ['nabadzība', 'бедность'], ['bagātība', 'богатство'],
    ['sociālais', 'социальный'], ['labklājība', 'благосостояние'], ['inflācija', 'инфляция'],
    ['nodoklis', 'налог'], ['budžets', 'бюджет'], ['investīcija', 'инвестиция'],
    ['kredīts', 'кредит'], ['procenti', 'проценты'], ['aizdevums', 'заём'],
  ].map(([lv, ru]) => (lv === 'tolerance' ? ['toleranc', ru] : lv === 'sociālais' ? ['sociālais atbalsts', 'соц. поддержка'] : [lv, ru]))),
  ...batch('Среда', 'B1', [
    ['atkritumi', 'отходы'], ['pārstrāde', 'переработка'], ['piesārņojums', 'загрязнение'],
    ['klimats', 'климат'], ['siltumnīcefekts', 'парниковый эффект'], ['atjaunojamā', 'возобновляемая'],
    ['enerģija', 'энергия'], ['saules paneļi', 'солнечные панели'], ['vējš', 'ветер'],
  ].map(([lv, ru]) => (lv === 'atjaunojamā' ? ['atjaunojamā enerģija', 'ВИЭ'] : [lv, ru]))),
  ...batch('Наука', 'B1', [
    ['zinātne', 'наука'], ['pētniecība', 'исследование'], ['eksperiments', 'эксперимент'],
    ['hipotēze', 'гипотезa'], ['secinājums', 'вывод'], ['pierādījums', 'доказательство'],
    ['fizika', 'физика'], ['ķīmija', 'химия'], ['bioloģija', 'биология'], ['matemātika', 'математика'],
  ].map(([lv, ru]) => (lv === 'hipotēze' ? ['hipotēze', 'гипотеза'] : [lv, ru]))),
  ...batch('Числа', 'A1', [
    ['četri', 'четыре'], ['pieci', 'пять'], ['seši', 'шесть'], ['septiņi', 'семь'],
    ['astoņi', 'восемь'], ['deviņi', 'девять'], ['vienpadsmit', 'одиннадцать'],
    ['divpadsmit', 'двенадцать'], ['piecdesmit', 'пятьдесят'], ['tūkstotis', 'тысяча'],
  ]),
  ...batch('Цвета', 'A1', [
    ['brūns', 'коричневый'], ['rozā', 'розовый'], ['oranžs', 'оранжевый'], ['violet', 'фиолетовый'],
    ['pelēks', 'серый'], ['zelt', 'золотой'], ['sudrabs', 'серебряный'],
  ].map(([lv, ru]) => {
    if (lv === 'violet') return ['violets', 'фиолетовый']
    if (lv === 'zelt') return ['zelts', 'золото']
    if (lv === 'sudrabs') return ['sudrabs', 'серебро']
    return [lv, ru]
  })),
  ...batch('Одежда', 'A2', [
    ['mētelis', 'пальто'], ['jak', 'куртка'], ['šalle', 'шарф'], ['cimi', 'перчатки'],
    ['zābaki', 'сапоги'], ['sandales', 'сандалии'], ['kostīms', 'костюм'], ['krekls', 'рубашка'],
  ].map(([lv, ru]) => {
    if (lv === 'jak') return ['jaka', 'куртка']
    if (lv === 'cimi') return ['cimdi', 'перчатки']
    return [lv, ru]
  })),
  ...batch('Семья', 'A2', [
    ['vecvecmāte', 'бабушка'], ['vecvectēvs', 'дедушка'], ['māsina', 'двоюродная сестра'],
    ['brālēns', 'двоюродный брат'], ['radinieks', 'родственник'], ['paziņa', 'знакомый'],
    ['kaimiņš', 'сосед'], ['draugi', 'друзья'], ['pāris', 'пара'],
  ].map(([lv, ru]) => (lv === 'draugi' ? ['draugs', 'друг'] : [lv, ru]))),
  ...batch('Быт', 'A2', [
    ['reģistrācija', 'регистрация'], ['apliecība', 'удостоверение'], ['licence', 'лицензия'],
    ['apdrošināšana', 'страховка'], ['līgums', 'договор'], ['paraksts', 'подпись'],
    ['form', 'форма'], ['pieteikums', 'заявление'], ['apstiprinājums', 'подтверждение'],
  ].map(([lv, ru]) => (lv === 'form' ? ['forma', 'форма'] : [lv, ru]))),
  ...batch('Приветствия', 'A1', [
    ['kā iet', 'как дела'], ['kā jums klājas', 'как у вас дела'], ['prieks', 'рад'],
    ['žēl', 'жаль'], ['veiksmi', 'удачи'], ['apsveicu', 'поздравляю'],
  ].map(([lv, ru]) => {
    if (lv === 'kā iet') return ['kā iet?', 'как дела?']
    if (lv === 'prieks') return ['prieks iepazīties', 'приятно познакомиться']
    return [lv, ru]
  })),
]
