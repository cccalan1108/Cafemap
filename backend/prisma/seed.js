const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  
  await prisma.cafe.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleared previous data.');

  
  const hashedPassword = await bcrypt.hash('password123', 10);
  const seedUser = await prisma.user.create({
    data: {
      email: 'admin@cafemap.com', 
      name: '官方推薦',            
      password: hashedPassword,
    },
  });
  console.log(`Created user '${seedUser.name}' with id: ${seedUser.id}`);


  const cafesData = [
    {
      title: 'CURISTA COFFEE 奎士咖啡 市府店',
      address: '臺北市信義區忠孝東路四段563號1樓',
      latitude: 25.04231,
      longitude: 121.56588,
      imageUrl: 'https://images.unsplash.com/photo-1511920183353-241c1b00080c?q=80&w=600',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=CURISTA+COFFEE+奎士咖啡+市府店'
    },
    {
      title: 'Single Origin espresso & roast',
      address: '臺北市信義區吳興街220巷35-2號 2F',
      latitude: 25.027116,
      longitude: 121.562237,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Single+Origin+espresso+roast+台北市信義區莊敬路'
    },
    {
      title: 'NORMAL COFFEE',
      address: '臺北市信義區忠孝東路五段68號24樓',
      latitude: 25.0401943,
      longitude: 121.5670107,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d713b22e8b4?q=80&w=600',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=NORMAL+COFFEE+信義店'
    },
    {
      title: 'Draft Land',
      address: '台北市信義區松高路19號',
      latitude: 25.04359,
      longitude: 121.56701,
      imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4469c?q=80&w=600',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Draft+Land+信義'
    },
    {
      title: 'CAFE ACME',
      address: '台北市信義區信義路五段7號35樓',
      latitude: 25.03361,
      longitude: 121.56450,
      imageUrl: 'https://images.unsplash.com/photo-1512568400610-62381bc80b61?q=80&w=600',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=CAFE+ACME+Taipei+101'
    }
  ];
  
  //user ID加入到每筆cafe資料中
  const cafesToCreate = cafesData.map(cafe => ({
    ...cafe,
    authorId: seedUser.id
  }));

  //一次建立所有咖啡廳
  await prisma.cafe.createMany({
    data: cafesToCreate,
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });