document.getElementById('image-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const prompt = document.getElementById('prompt').value;
    const response = await fetch('/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
  
    if (response.ok) {
      const data = await response.json();
      const imageUrl = data.imageUrl;
      const imageElement = document.getElementById('generated-image');
      imageElement.src = imageUrl;
      imageElement.style.display = 'block';
    } else {
      alert('Image generation failed.');
    }
  });
  