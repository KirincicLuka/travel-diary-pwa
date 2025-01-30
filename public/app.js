let cameraStream;

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  showInstallButton();
});

function showInstallButton() {
  const button = document.getElementById('install-button');
  if (button) {
    button.style.display = 'block';
    button.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Korisnik je prihvatio instalaciju');
          } else {
            console.log('Korisnik je odbio instalaciju');
          }
          deferredPrompt = null;
        });
      }
    });
  }
}

document.getElementById('save-note-button').addEventListener('click', () => {
  const noteInput = document.getElementById('note-input');
  const noteText = noteInput.value.trim();

  if (noteText) {
    const pendingNotes = JSON.parse(localStorage.getItem('pendingNotes')) || [];
    pendingNotes.push(noteText);
    localStorage.setItem('pendingNotes', JSON.stringify(pendingNotes));
    noteInput.value = '';
    console.log('Spremljena bilješka:', noteText);
  } else {
    alert('Unesite bilješku prije spremanja!');
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registriran:', registration);
    })
    .catch((error) => {
      console.error('Greška prilikom registracije Service Workera:', error);
    });
}

document.getElementById('camera-button').addEventListener('click', async () => {
  try {
    // Otvori kameru
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const cameraPreview = document.getElementById('camera-preview');
    cameraPreview.srcObject = cameraStream;
    cameraPreview.style.display = 'block';

    // Snimi fotografiju nakon 1 sekunde (možete promijeniti u klik na drugi gumb)
    setTimeout(() => {
      takePhoto();
    }, 1000); // Snimi fotografiju nakon 1 sekunde
  } catch (error) {
    console.error('Greška prilikom pristupa kameri:', error);
    alert('Nije moguće pristupiti kameri. Provjerite dozvole i hardver.');
  }
});

function takePhoto() {
  const cameraPreview = document.getElementById('camera-preview');
  const canvas = document.getElementById('canvas');
  const photoPreview = document.getElementById('photo-preview');

  // Postavi dimenzije canvasa na dimenzije video streama
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;

  // Snimi trenutni okvir iz video streama na canvas
  const context = canvas.getContext('2d');
  context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

  // Pretvori canvas u sliku (base64 format)
  const photoData = canvas.toDataURL('image/png');

  // Prikaži fotografiju
  photoPreview.src = photoData;
  photoPreview.style.display = 'block';

  // Spremi fotografiju u lokalnu pohranu (ili bazu)
  savePhoto(photoData);

  // Zatvori kameru
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraPreview.srcObject = null;
    cameraPreview.style.display = 'none';
  }
}

function savePhoto(photoData) {
  // Spremi fotografiju u localStorage (možete zamijeniti s API pozivom za spremanje u bazu)
  const savedPhotos = JSON.parse(localStorage.getItem('savedPhotos')) || [];
  savedPhotos.push(photoData);
  localStorage.setItem('savedPhotos', JSON.stringify(savedPhotos));

  console.log('Fotografija spremljena:', photoData);
  displaySavedPhotos();
}

function deletePhoto(index) {
  let savedPhotos = JSON.parse(localStorage.getItem('savedPhotos')) || [];
  
  savedPhotos.splice(index, 1); // Ukloni sliku s danog indeksa
  localStorage.setItem('savedPhotos', JSON.stringify(savedPhotos)); // Ažuriraj storage

  displaySavedPhotos(); // Ponovno prikaži ažurirani popis slika
}


function displaySavedPhotos() {
  const savedPhotosContainer = document.getElementById('saved-photos');
  savedPhotosContainer.innerHTML = ''; // Očisti postojeći sadržaj

  // Dohvati spremljene fotografije iz localStorage
  const savedPhotos = JSON.parse(localStorage.getItem('savedPhotos')) || [];

  // Prikaži svaku spremljenu fotografiju
  savedPhotos.forEach((photoData, index) => {
    const imgContainer = document.createElement('div');
    imgContainer.style.display = 'inline-block';
    imgContainer.style.margin = '5px';

    const imgElement = document.createElement('img');
    imgElement.src = photoData;
    imgElement.alt = `Spremljena fotografija ${index + 1}`;
    imgElement.style.width = '100px';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Obriši';
    deleteButton.style.display = 'block';
    deleteButton.style.marginTop = '5px';
    deleteButton.addEventListener('click', () => deletePhoto(index));

    imgContainer.appendChild(imgElement);
    imgContainer.appendChild(deleteButton);
    savedPhotosContainer.appendChild(imgContainer);
  });
}

// Prikaži spremljene fotografije prilikom učitavanja stranice
window.addEventListener('load', () => {
  displaySavedPhotos();
});