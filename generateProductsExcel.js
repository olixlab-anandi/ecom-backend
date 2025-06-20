const XLSX = require("xlsx");

const categories = [
  { _id: "683930d733657708a8ceeabb", title: "Men" },
  { _id: "683930e233657708a8ceeac1", title: "Women" },
  { _id: "6839a20b81d43ac72d3c7820", title: "Children" },
];

const subCategories = [
  {
    _id: "6839369c160af229dde94d5d",
    title: "Saree",
    categoryId: "683930e233657708a8ceeac1",
  },
  {
    _id: "683936ad160af229dde94d63",
    title: "Traditional",
    categoryId: "683930e233657708a8ceeac1",
  },
  {
    _id: "683936bc160af229dde94d69",
    title: "T-Shirt",
    categoryId: "683930e233657708a8ceeac1",
  },
  {
    _id: "683936cc160af229dde94d6f",
    title: "Blazer",
    categoryId: "683930e233657708a8ceeac1",
  },
  {
    _id: "683936e9160af229dde94d75",
    title: "Jeans",
    categoryId: "683930e233657708a8ceeac1",
  },
  {
    _id: "68393707160af229dde94d7b",
    title: "Suit",
    categoryId: "683930e233657708a8ceeac1",
  },
  {
    _id: "683938de160af229dde94d93",
    title: "T-Shirt",
    categoryId: "683930d733657708a8ceeabb",
  },
  {
    _id: "68393901160af229dde94d9a",
    title: "Shirt",
    categoryId: "683930d733657708a8ceeabb",
  },
  {
    _id: "68393914160af229dde94da7",
    title: "Formal",
    categoryId: "683930d733657708a8ceeabb",
  },
  {
    _id: "68393932160af229dde94db4",
    title: "Jacket",
    categoryId: "683930d733657708a8ceeabb",
  },
  {
    _id: "6839394d160af229dde94dbb",
    title: "Jeans",
    categoryId: "683930d733657708a8ceeabb",
  },
  {
    _id: "68393968160af229dde94dc2",
    title: "Shirt",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "68393981160af229dde94dc9",
    title: "Frok",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "68393996160af229dde94dd0",
    title: "Night Wear",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "683939ab160af229dde94dd7",
    title: "T-Shirt",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "683939c2160af229dde94dde",
    title: "Night Wear For boy",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "683939df160af229dde94de5",
    title: "Jeans",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "683939f4160af229dde94dec",
    title: "Shorts",
    categoryId: "6839a20b81d43ac72d3c7820",
  },
  {
    _id: "683e83368aaea04ca04c3358",
    title: "Kurti",
    categoryId: "683930e233657708a8ceeac1",
  },
];

const imageUrls = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
  "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg",
  "https://images.pexels.com/photos/936075/pexels-photo-936075.jpeg",
  "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg",
  "https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg",
  "https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg",
];

const discounts = [
  { type: "percentage", value: 10 },
  { type: "fixedAmount", value: 200 },
  { type: "percentage", value: 5 },
  { type: "fixedAmount", value: 100 },
];

const products = [];
for (let i = 0; i < 50; i++) {
  const subCat = subCategories[i % subCategories.length];
  const cat = categories.find((c) => c._id === subCat.categoryId);
  const discount = discounts[i % discounts.length];
  const image = imageUrls[i % imageUrls.length];
  products.push({
    image,
    title: `${subCat.title} ${i + 1}`,
    price: 500 + i * 25,
    Category: JSON.stringify({ _id: cat._id, title: cat.title }),
    subCategory: JSON.stringify({ _id: subCat._id, title: subCat.title }),
    description: `Description for ${subCat.title} ${i + 1}`,
    _id: (1000 + i).toString(),
    longDescription: `Long description for ${subCat.title} ${i + 1}`,
    discount: JSON.stringify(discount),
    stock: 10 + (i % 20),
    categoryId: cat._id,
    subCategoryId: subCat._id,
  });
}

const ws = XLSX.utils.json_to_sheet(products);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Products");
XLSX.writeFile(wb, "products.xlsx");
console.log("Excel file 'products.xlsx' created!");
