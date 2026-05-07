import { PrismaClient, Size, OrderStatus, DeliveryMethod, PaymentMethod, PaymentStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const hashPwd = async (password: string) => {
  return argon2.hash(password, { type: argon2.argon2id });
};

// Test users data
const testUsers = {
  admin: {
    email: 'admin@wearstore.ua',
    password: 'admin123',
    firstName: 'Адміністратор',
    lastName: 'WearStore',
    phone: '+380501234567',
    role: 'ADMIN' as const,
  },
  managers: [
    { email: 'manager1@wearstore.ua', password: 'manager123', firstName: 'Олена', lastName: 'Петренко', phone: '+380502345678' },
    { email: 'manager2@wearstore.ua', password: 'manager123', firstName: 'Ірина', lastName: 'Коваленко', phone: '+380503456789' },
  ],
  clients: [
    { email: 'client1@example.com', password: 'client123', firstName: 'Марія', lastName: 'Шевченко', phone: '+380671234567' },
    { email: 'client2@example.com', password: 'client123', firstName: 'Анна', lastName: 'Бондаренко', phone: '+380672345678' },
    { email: 'client3@example.com', password: 'client123', firstName: 'Катерина', lastName: 'Мельник', phone: '+380673456789' },
    { email: 'client4@example.com', password: 'client123', firstName: 'Юлія', lastName: 'Савченко', phone: '+380674567890' },
    { email: 'client5@example.com', password: 'client123', firstName: 'Олександра', lastName: 'Литвиненко', phone: '+380675678901' },
    { email: 'client6@example.com', password: 'client123', firstName: 'Вікторія', lastName: 'Мороз', phone: '+380676789012' },
    { email: 'client7@example.com', password: 'client123', firstName: 'Наталія', lastName: 'Ткаченко', phone: '+380677890123' },
    { email: 'client8@example.com', password: 'client123', firstName: 'Дарина', lastName: 'Лисенко', phone: '+380678901234' },
    { email: 'client9@example.com', password: 'client123', firstName: 'Софія', lastName: 'Павленко', phone: '+380679012345' },
    { email: 'client10@example.com', password: 'client123', firstName: 'Тетяна', lastName: 'Кравченко', phone: '+380670123456' },
  ],
};

// Categories
const categories = [
  { name: 'Сукні', slug: 'sukni', description: 'Елегантні сукні на будь-який випадок - від повсякденних до вечірніх', sortOrder: 1 },
  { name: 'Блузи та топи', slug: 'bluzy-topy', description: 'Стильні блузи, сорочки та топи для створення ідеального образу', sortOrder: 2 },
  { name: 'Спідниці та штани', slug: 'spidnytsi-shtany', description: 'Різноманітні спідниці та штани на будь-який смак', sortOrder: 3 },
  { name: 'Верхній одяг', slug: 'verhnii-odiag', description: 'Пальта, куртки, жакети та тренчі', sortOrder: 4 },
];

// Products - 10 per category = 40 total
const products = [
  // Сукні (10)
  { sku: 'DR-001', name: 'Сукня міді "Елегант"', slug: 'suknia-midi-elegant', categorySlug: 'sukni', basePrice: 2499, salePrice: 1999, material: 'Поліестер 95%, Еластан 5%', isFeatured: true, description: 'Вишукана сукня міді з якісної тканини. Ідеально підходить для офісу та особливих подій.' },
  { sku: 'DR-002', name: 'Сукня коктейльна "Зірка"', slug: 'suknia-kokteilna-zirka', categorySlug: 'sukni', basePrice: 3299, salePrice: null, material: 'Шовк 100%', isFeatured: true, description: 'Чарівна коктейльна сукня для вечірок та святкових подій. Прикрашена делікатним блиском.' },
  { sku: 'DR-003', name: 'Сукня максі "Богема"', slug: 'suknia-maksi-bohema', categorySlug: 'sukni', basePrice: 2899, salePrice: 2499, material: 'Віскоза 100%', isFeatured: false, description: 'Легка літня сукня максі з яскравим принтом. Ідеальна для пляжного відпочинку.' },
  { sku: 'DR-004', name: 'Сукня офісна "Діловий стиль"', slug: 'suknia-ofisna-dilovyi-styl', categorySlug: 'sukni', basePrice: 2199, salePrice: null, material: 'Поліестер 70%, Віскоза 30%', isFeatured: false, description: 'Класична офісна сукня прямого крою. Стримана елегантність для ділових зустрічей.' },
  { sku: 'DR-005', name: 'Сукня вечірня "Гламур"', slug: 'suknia-vechirnia-hlamur', categorySlug: 'sukni', basePrice: 4999, salePrice: 3999, material: 'Атлас 100%', isFeatured: true, description: 'Розкішна вечірня сукня в підлогу. Зробить вас королевою будь-якого заходу.' },
  { sku: 'DR-006', name: 'Сукня повсякденна "Комфорт"', slug: 'suknia-povsiakdenna-komfort', categorySlug: 'sukni', basePrice: 1599, salePrice: null, material: 'Бавовна 95%, Еластан 5%', isFeatured: false, description: 'Зручна повсякденна сукня з м\'якої тканини. Ідеальна для прогулянок та шопінгу.' },
  { sku: 'DR-007', name: 'Сукня трикотажна "Затишок"', slug: 'suknia-trykotazhna-zatyshok', categorySlug: 'sukni', basePrice: 1899, salePrice: 1499, material: 'Трикотаж', isFeatured: false, description: 'Тепла трикотажна сукня для холодної пори. Поєднує комфорт та стиль.' },
  { sku: 'DR-008', name: 'Сукня сорочка "Casual"', slug: 'suknia-sorochka-casual', categorySlug: 'sukni', basePrice: 1799, salePrice: null, material: 'Бавовна 100%', isFeatured: false, description: 'Стильна сукня-сорочка для створення невимушеного образу.' },
  { sku: 'DR-009', name: 'Сукня з запахом "Фемінін"', slug: 'suknia-z-zapakhom-feminin', categorySlug: 'sukni', basePrice: 2299, salePrice: null, material: 'Креп', isFeatured: true, description: 'Жіночна сукня з запахом, що підкреслює талію. Універсальна модель на всі випадки.' },
  { sku: 'DR-010', name: 'Сукня джинсова "Денім"', slug: 'suknia-dzhynsova-denim', categorySlug: 'sukni', basePrice: 1999, salePrice: 1699, material: 'Деним', isFeatured: false, description: 'Молодіжна джинсова сукня. Стильно та практично для будь-якого дня.' },

  // Блузи та топи (10)
  { sku: 'BL-001', name: 'Блуза офісна "Класика"', slug: 'bluza-ofisna-klasyka', categorySlug: 'bluzy-topy', basePrice: 1299, salePrice: null, material: 'Бавовна 100%', isFeatured: false, description: 'Класична офісна блуза білого кольору. Виготовлена з натуральних тканин.' },
  { sku: 'BL-002', name: 'Блуза шовкова "Ніжність"', slug: 'bluza-shovkova-nizhnist', categorySlug: 'bluzy-topy', basePrice: 2199, salePrice: 1899, material: 'Шовк 100%', isFeatured: true, description: 'Розкішна шовкова блуза пастельних тонів. Ідеальна для романтичних побачень.' },
  { sku: 'BL-003', name: 'Топ трикотажний "Базовий"', slug: 'top-trykotazhnyi-bazovyi', categorySlug: 'bluzy-topy', basePrice: 599, salePrice: null, material: 'Бавовна 95%, Еластан 5%', isFeatured: false, description: 'Базовий трикотажний топ, який поєднується з усім. Необхідна річ у гардеробі.' },
  { sku: 'BL-004', name: 'Блуза з бантом "Романтика"', slug: 'bluza-z-bantom-romantyka', categorySlug: 'bluzy-topy', basePrice: 1599, salePrice: 1299, material: 'Шифон', isFeatured: true, description: 'Романтична блуза з бантом на шиї. Додасть жіночності будь-якому образу.' },
  { sku: 'BL-005', name: 'Сорочка oversize "Свобода"', slug: 'sorochka-oversize-svoboda', categorySlug: 'bluzy-topy', basePrice: 1399, salePrice: null, material: 'Бавовна 100%', isFeatured: false, description: 'Стильна сорочка вільного крою. Тренд сезону для впевнених у собі жінок.' },
  { sku: 'BL-006', name: 'Топ на бретелях "Літо"', slug: 'top-na-breteliakh-lito', categorySlug: 'bluzy-topy', basePrice: 799, salePrice: 599, material: 'Віскоза 100%', isFeatured: false, description: 'Легкий літній топ на тонких бретелях. Ідеальний для спекотних днів.' },
  { sku: 'BL-007', name: 'Блуза з рюшами "Кокетка"', slug: 'bluza-z-riushamy-koketka', categorySlug: 'bluzy-topy', basePrice: 1499, salePrice: null, material: 'Поліестер 100%', isFeatured: false, description: 'Ефектна блуза з рюшами. Приверне до вас увагу на будь-якому заході.' },
  { sku: 'BL-008', name: 'Боді "Силует"', slug: 'bodi-syluet', categorySlug: 'bluzy-topy', basePrice: 999, salePrice: null, material: 'Віскоза 90%, Еластан 10%', isFeatured: true, description: 'Елегантне боді, що ідеально сидить. Поєднуйте зі спідницями та штанами.' },
  { sku: 'BL-009', name: 'Блуза з відкритими плечима "Грація"', slug: 'bluza-z-vidkrytymy-plechyma-hratsiia', categorySlug: 'bluzy-topy', basePrice: 1299, salePrice: 999, material: 'Бавовна 100%', isFeatured: false, description: 'Жіночна блуза з відкритими плечима. Підкреслить вашу красу.' },
  { sku: 'BL-010', name: 'Гольф "Тепло"', slug: 'holf-teplo', categorySlug: 'bluzy-topy', basePrice: 899, salePrice: null, material: 'Трикотаж', isFeatured: false, description: 'Базовий гольф на кожен день. Зігріє в холодну пору та виглядає стильно.' },

  // Спідниці та штани (10)
  { sku: 'SK-001', name: 'Спідниця олівець "Бізнес"', slug: 'spidnytsya-olivets-biznes', categorySlug: 'spidnytsi-shtany', basePrice: 1599, salePrice: null, material: 'Вовна 70%, Поліестер 30%', isFeatured: false, description: 'Елегантна спідниця олівець для ділових зустрічей та офісу.' },
  { sku: 'SK-002', name: 'Спідниця пліссе "Повітря"', slug: 'spidnytsya-plisse-povitria', categorySlug: 'spidnytsi-shtany', basePrice: 1899, salePrice: 1599, material: 'Поліестер 100%', isFeatured: true, description: 'Легка спідниця пліссе, що красиво розвівається при ходьбі.' },
  { sku: 'SK-003', name: 'Спідниця міні "Молодість"', slug: 'spidnytsya-mini-molodist', categorySlug: 'spidnytsi-shtany', basePrice: 1199, salePrice: null, material: 'Деним', isFeatured: false, description: 'Молодіжна джинсова міні-спідниця. Стильно та сміливо.' },
  { sku: 'PT-001', name: 'Штани класичні "Стиль"', slug: 'shtany-klasychni-styl', categorySlug: 'spidnytsi-shtany', basePrice: 1899, salePrice: null, material: 'Бавовна 60%, Поліестер 40%', isFeatured: false, description: 'Класичні штани прямого крою. Універсальні для офісу та повсякдення.' },
  { sku: 'PT-002', name: 'Штани палаццо "Свобода"', slug: 'shtany-palatstso-svoboda', categorySlug: 'spidnytsi-shtany', basePrice: 2199, salePrice: 1799, material: 'Льон 100%', isFeatured: true, description: 'Широкі штани палаццо з натурального льону. Комфорт та елегантність.' },
  { sku: 'PT-003', name: 'Джинси скіні "Фігура"', slug: 'dzhinsy-skini-fihura', categorySlug: 'spidnytsi-shtany', basePrice: 1799, salePrice: null, material: 'Деним з еластаном', isFeatured: false, description: 'Облягаючі джинси, що підкреслюють фігуру. Базова модель для будь-якого гардеробу.' },
  { sku: 'PT-004', name: 'Штани карго "Актив"', slug: 'shtany-karho-aktyv', categorySlug: 'spidnytsi-shtany', basePrice: 1699, salePrice: 1399, material: 'Бавовна 100%', isFeatured: false, description: 'Практичні штани карго з кишенями. Для активного способу життя.' },
  { sku: 'SK-004', name: 'Спідниця шкіряна "Рок"', slug: 'spidnytsya-shkiriana-rok', categorySlug: 'spidnytsi-shtany', basePrice: 2499, salePrice: null, material: 'Еко-шкіра', isFeatured: true, description: 'Стильна шкіряна спідниця для сміливих образів.' },
  { sku: 'PT-005', name: 'Легінси "Спорт-шик"', slug: 'lehinsy-sport-shyk', categorySlug: 'spidnytsi-shtany', basePrice: 999, salePrice: 799, material: 'Поліестер 80%, Еластан 20%', isFeatured: false, description: 'Зручні легінси для занять спортом та повсякденного носіння.' },
  { sku: 'SK-005', name: 'Спідниця трапеція "Грайливість"', slug: 'spidnytsya-trapetsiia-hrailyvyst', categorySlug: 'spidnytsi-shtany', basePrice: 1399, salePrice: null, material: 'Бавовна 100%', isFeatured: false, description: 'Жіночна спідниця-трапеція. Підходить для будь-якого типу фігури.' },

  // Верхній одяг (10)
  { sku: 'OW-001', name: 'Пальто "Парижанка"', slug: 'palto-paryzhanka', categorySlug: 'verhnii-odiag', basePrice: 5999, salePrice: 4999, material: 'Вовна 80%, Кашемір 20%', isFeatured: true, description: 'Елегантне пальто в класичному стилі. Ідеальне для осені та весни.' },
  { sku: 'OW-002', name: 'Тренч "Лондон"', slug: 'trench-london', categorySlug: 'verhnii-odiag', basePrice: 4499, salePrice: null, material: 'Бавовна з водовідштовхувальним покриттям', isFeatured: true, description: 'Класичний тренч бежевого кольору. Незамінний в міжсезоння.' },
  { sku: 'OW-003', name: 'Куртка шкіряна "Байкер"', slug: 'kurtka-shkiriana-baiker', categorySlug: 'verhnii-odiag', basePrice: 6999, salePrice: 5999, material: 'Натуральна шкіра', isFeatured: true, description: 'Культова шкіряна куртка. Додасть образу сміливості та характеру.' },
  { sku: 'OW-004', name: 'Жакет "Офіс"', slug: 'zhaket-ofis', categorySlug: 'verhnii-odiag', basePrice: 2999, salePrice: null, material: 'Поліестер 65%, Віскоза 35%', isFeatured: false, description: 'Класичний офісний жакет. Доповнить діловий костюм.' },
  { sku: 'OW-005', name: 'Пуховик "Зима"', slug: 'pukhovyk-zyma', categorySlug: 'verhnii-odiag', basePrice: 4999, salePrice: 3999, material: 'Пух 90%, Перо 10%', isFeatured: false, description: 'Теплий пуховик для найхолодніших днів. Легкий та практичний.' },
  { sku: 'OW-006', name: 'Кардиган "Затишок"', slug: 'kardyhan-zatyshok', categorySlug: 'verhnii-odiag', basePrice: 1899, salePrice: 1599, material: 'Вовна мериноса', isFeatured: false, description: 'М\'який кардиган з натуральної вовни. Ідеальний для дому та офісу.' },
  { sku: 'OW-007', name: 'Бомбер "Спорт"', slug: 'bomber-sport', categorySlug: 'verhnii-odiag', basePrice: 2499, salePrice: null, material: 'Нейлон', isFeatured: false, description: 'Стильний бомбер у спортивному стилі. Для активних та молодих.' },
  { sku: 'OW-008', name: 'Пальто-халат "Мінімалізм"', slug: 'palto-khalat-minimalizm', categorySlug: 'verhnii-odiag', basePrice: 5499, salePrice: 4499, material: 'Вовна 100%', isFeatured: true, description: 'Пальто-халат з поясом. Втілення елегантної простоти.' },
  { sku: 'OW-009', name: 'Жилет "Тепло"', slug: 'zhylet-teplo', categorySlug: 'verhnii-odiag', basePrice: 1999, salePrice: null, material: 'Синтепон', isFeatured: false, description: 'Практичний жилет для прохолодної погоди. Легкий та теплий.' },
  { sku: 'OW-010', name: 'Плащ "Дощ"', slug: 'plashch-doshch', categorySlug: 'verhnii-odiag', basePrice: 2999, salePrice: 2499, material: 'Водонепроникна тканина', isFeatured: false, description: 'Практичний плащ для дощової погоди. Захист та стиль.' },
];

const colors = ['Чорний', 'Білий', 'Бежевий', 'Синій', 'Рожевий', 'Червоний'];
const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const deliveryMethods: DeliveryMethod[] = ['NOVA_POSHTA_WAREHOUSE', 'NOVA_POSHTA_COURIER', 'UKRPOSHTA'];
const paymentMethods: PaymentMethod[] = ['LIQPAY', 'CASH_ON_DELIVERY'];
const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();

  // Create Admin
  console.log('\n👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: testUsers.admin.email,
      passwordHash: await hashPwd(testUsers.admin.password),
      firstName: testUsers.admin.firstName,
      lastName: testUsers.admin.lastName,
      phone: testUsers.admin.phone,
      role: 'ADMIN',
      cart: { create: {} },
    },
  });
  console.log(`  ✓ Admin: ${admin.email} (password: ${testUsers.admin.password})`);

  // Create Managers
  console.log('\n👥 Creating manager users...');
  const managers = [];
  for (const manager of testUsers.managers) {
    const user = await prisma.user.create({
      data: {
        email: manager.email,
        passwordHash: await hashPwd(manager.password),
        firstName: manager.firstName,
        lastName: manager.lastName,
        phone: manager.phone,
        role: 'MANAGER',
        cart: { create: {} },
      },
    });
    managers.push(user);
    console.log(`  ✓ Manager: ${user.email} (password: ${manager.password})`);
  }

  // Create Clients
  console.log('\n👥 Creating client users...');
  const clients = [];
  for (const client of testUsers.clients) {
    const user = await prisma.user.create({
      data: {
        email: client.email,
        passwordHash: await hashPwd(client.password),
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        role: 'CLIENT',
        cart: { create: {} },
        addresses: {
          create: [
            {
              label: 'Домашня адреса',
              city: ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'][Math.floor(Math.random() * 5)],
              street: 'вул. Хрещатик',
              building: String(Math.floor(Math.random() * 100) + 1),
              apartment: String(Math.floor(Math.random() * 50) + 1),
              postalCode: String(10000 + Math.floor(Math.random() * 90000)),
              isDefault: true,
            },
          ],
        },
      },
      include: { addresses: true },
    });
    clients.push(user);
    console.log(`  ✓ Client: ${user.email} (password: ${client.password})`);
  }

  // Create Categories
  console.log('\n📁 Creating categories...');
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const category = await prisma.category.create({
      data: cat,
    });
    categoryMap.set(cat.slug, category.id);
    console.log(`  ✓ Category: ${category.name}`);
  }

  // Create Products
  console.log('\n🛍️ Creating 40 products...');
  const createdProducts = [];
  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    const product = await prisma.product.create({
      data: {
        sku: prod.sku,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.description.substring(0, 100),
        categoryId,
        basePrice: prod.basePrice,
        salePrice: prod.salePrice,
        material: prod.material,
        careInstructions: 'Делікатне прання при 30°C',
        isFeatured: prod.isFeatured,
        isActive: true,
      },
    });
    createdProducts.push(product);

    // Create variants (2-3 colors, all sizes)
    const productColors = colors.slice(0, Math.floor(Math.random() * 2) + 2);
    for (const color of productColors) {
      for (const size of sizes) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            color,
            stock: Math.floor(Math.random() * 20) + 5,
            priceAddon: 0,
          },
        });
      }
    }

    // Create product image
    const imageColor = prod.isFeatured ? 'e05070' : 'd4a5a5';
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: `https://placehold.co/600x800/fdf2f4/${imageColor}?text=${encodeURIComponent(prod.name.split(' ')[0])}`,
        altText: prod.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });

    console.log(`  ✓ Product: ${product.name}`);
  }

  // Create Orders for clients
  console.log('\n📦 Creating orders with history...');
  let orderCounter = 0;
  const year = new Date().getFullYear();

  for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const clientWithAddress = await prisma.user.findUnique({
      where: { id: client.id },
      include: { addresses: true },
    });

    const address = clientWithAddress?.addresses[0];
    const numOrders = Math.floor(Math.random() * 4) + 1; // 1-4 orders per client

    for (let j = 0; j < numOrders; j++) {
      orderCounter++;
      const orderNumber = `WS-${year}-${orderCounter.toString().padStart(6, '0')}`;

      // Random order items (1-3 products)
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderProducts = [];
      let subtotal = 0;

      for (let k = 0; k < numItems; k++) {
        const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const unitPrice = randomProduct.salePrice || randomProduct.basePrice;
        const totalPrice = unitPrice.toNumber() * quantity;
        subtotal += totalPrice;

        orderProducts.push({
          productSnapshot: {
            productId: randomProduct.id,
            name: randomProduct.name,
            slug: randomProduct.slug,
            image: null,
            size: sizes[Math.floor(Math.random() * sizes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
          },
          quantity,
          unitPrice,
          totalPrice,
        });
      }

      const deliveryMethod = deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const shippingCost = subtotal >= 2000 ? 0 : (deliveryMethod === 'NOVA_POSHTA_COURIER' ? 120 : 70);
      // Orders that are confirmed+ should be paid (for realistic reports)
      const paidStatuses: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
      const paymentStatus: PaymentStatus = paidStatuses.includes(status) ? 'PAID' : (status === 'CANCELLED' ? 'FAILED' : 'PENDING');

      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: client.id,
          status,
          subtotal,
          discountAmount: 0,
          shippingCost,
          totalAmount: subtotal + shippingCost,
          deliveryMethod,
          addressId: address?.id,
          addressSnapshot: address ? {
            city: address.city,
            street: address.street,
            building: address.building,
            apartment: address.apartment,
            postalCode: address.postalCode,
          } : {},
          paymentMethod,
          paymentStatus,
          items: {
            create: orderProducts,
          },
          statusHistory: {
            create: {
              toStatus: status,
              comment: 'Замовлення створено',
            },
          },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        },
      });

      console.log(`  ✓ Order ${orderNumber} for ${client.firstName} ${client.lastName} - ${status}`);
    }
  }

  // Create Promo Codes
  console.log('\n🎫 Creating promo codes...');
  const promoCodes = [
    { code: 'WELCOME10', type: 'PERCENTAGE' as const, value: 10, minOrderAmount: 500, maxUses: 1000 },
    { code: 'SALE20', type: 'PERCENTAGE' as const, value: 20, minOrderAmount: 1500, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { code: 'FREESHIP', type: 'FIXED_AMOUNT' as const, value: 100, minOrderAmount: 1000 },
    { code: 'VIP30', type: 'PERCENTAGE' as const, value: 30, minOrderAmount: 3000, maxUses: 50 },
  ];

  for (const promo of promoCodes) {
    const created = await prisma.promoCode.create({ data: promo });
    console.log(`  ✓ Promo: ${created.code} - ${created.type === 'PERCENTAGE' ? `${created.value}%` : `${created.value} грн`}`);
  }

  // Summary
  console.log('\n✅ Seed completed successfully!\n');
  console.log('='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  • 1 Admin: admin@wearstore.ua / admin123`);
  console.log(`  • 2 Managers: manager1@wearstore.ua, manager2@wearstore.ua / manager123`);
  console.log(`  • 10 Clients: client1@example.com - client10@example.com / client123`);
  console.log(`  • 4 Categories`);
  console.log(`  • 40 Products with variants`);
  console.log(`  • ${orderCounter} Orders with history`);
  console.log(`  • 4 Promo codes`);
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
