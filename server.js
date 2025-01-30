const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serviraj statičke datoteke (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta za početnu stranicu
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`Server pokrenut na http://localhost:${PORT}`);
});