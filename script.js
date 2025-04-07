const SUPABASE_URL = "https://pmqssomrkzkbnoetvsce.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtcXNzb21ya3prYm5vZXR2c2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzAyMDUsImV4cCI6MjA1OTEwNjIwNX0.hjOaHqQ_Wdh0CB5rqHywjtKfrHDchUlZDbElBH7rNEQ";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
document.getElementById("train-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const trainName = document.getElementById("train_name").value;
    const departureTime = document.getElementById("departure_time").value;
    const arrivalTime = document.getElementById("arrival_time").value;
    const departureStation = document.getElementById("departure_station").value;
    const arrivalStation = document.getElementById("arrival_station").value;

    const { data, error } = await supabase
        .from("trains")
        .insert([
            {
                train_name: trainName,
                departure_time: departureTime,
                arrival_time: arrivalTime,
                departure_station: departureStation,
                arrival_station: arrivalStation,
            },
        ]);

        

    if (error) {
        console.error("Xato:", error.message);
        alert("Poyezdni qo'shishda xatolik yuz berdi!");
    } else {
        alert("Poyezd muvaffaqiyatli qo'shildi!");
        
        fetchTrains();
    }
});

document.getElementById("cargo-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const trainId = document.getElementById("train_id").value;
    const cargoType = document.getElementById("cargo_type").value;
    const weight = document.getElementById("weight").value;
    const sender = document.getElementById("sender").value;
    const receiver = document.getElementById("receiver").value;

    const { data, error } = await supabase
        .from("cargo")
        .insert([
            {
                train_id: trainId,
                cargo_type: cargoType,
                weight: weight,
                sender: sender,
                receiver: receiver,
            },
        ]);
        

    if (error) {
        console.error("Xato:", error.message);
        alert("Yukni qo'shishda xatolik yuz berdi!");
    } else {
        alert("Yuk muvaffaqiyatli qo'shildi!");
        fetchCargo();  // Yuklar ro'yxatini yangilash
    }
});

async function fetchTrains() {
    const { data, error } = await supabase
        .from("trains")
        .select("*");

    if (error) {
        console.error("Xato:", error.message);
        alert("Poyezdlarni olishda xatolik yuz berdi!");
    } else {
        const trainList = document.getElementById("train-list");
        trainList.innerHTML = "";
        data.forEach((train) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td>${train.train_id}</td>
                    <td>${train.train_name}</td>
                    <td>${train.departure_station}</td>
                    <td>${train.arrival_station}</td>
                    <td>${train.departure_time}</td>
                    <td>${train.arrival_time}</td>
                    <td><button onclick="removeElement(${train.train_id})">❌</button></td>
            `
            trainList.appendChild(tr);
        });

        // Poyezdlar ro'yxatini yuklash uchun select elementini yangilash
        const trainSelect = document.getElementById("train_id");
        trainSelect.innerHTML = ""; 
        data.forEach((train) => {
            const option = document.createElement("option");
            option.value = train.train_id;
            option.textContent = train.train_name;
            trainSelect.appendChild(option);
        });
    }
}
async function removeElement(trainId) {
    const confirmDelete = confirm("Haqiqatdan ham ushbu poyezdni o‘chirmoqchimisiz?");
    if (!confirmDelete) return;
  
    const { error } = await supabase
      .from('trains')
      .delete()
      .eq('train_id', trainId);
  
      

    if (error) {
      alert("Xatolik yuz berdi: " + error.message);
    } else {
      alert("Poyezd o‘chirildi!");
      location.reload(); 
    }
  }
  
async function fetchCargo() {
    const { data, error } = await supabase
        .from("cargo")
        .select("*");

    if (error) {
        console.error("Xato:", error.message);
        alert("Yuklarni olishda xatolik yuz berdi!");
    } else {
        const cargoList = document.getElementById("cargo-list");
        cargoList.innerHTML = "";
        data.forEach((cargo) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td>${cargo.cargo_id}</td>
                    <td>${cargo.cargo_type}</td>
                    <td>${cargo.weight}</td>
                    <td>${cargo.sender}</td>
                    <td>${cargo.receiver}</td>
            `
            cargoList.appendChild(tr);
        });
    }
}


async function loadCargoTrains() {
    const weightOption = document.getElementById('weightSelect').value;
    const weightOptionInput = document.getElementById('total').value;
  
    
    const operator = weightOption === 'more' ? 'gt' : 'lt'; // gt = greater than, lt = less than
  
    const { data, error } = await supabase
      .from('cargo')
      .select('*, trains(*)') 
      [operator]('weight', weightOptionInput); 
  
    if (error) {
      console.error('Xatolik:', error);
      return;
    }
  
    const listDiv = document.getElementById('trainList');
    listDiv.innerHTML = '';
  
    if (data.length === 0) {
      listDiv.innerHTML = 'Mos poyezdlar topilmadi.';
      return;
    }
  
    data.forEach((item, i) => {
      const train = item.trains;
      const cargo = item;
  
      const el = document.createElement('tr');
      el.innerHTML = `
       <tr>
                    <td>${i+1}</td>
                    <td>${train.train_id}</td>
                    <td>${train.train_name}</td>
                    <td>${train.departure_station}</td>
                    <td>${train.arrival_station}</td>
                    <td>${cargo.cargo_type}</td>
                    <td>${cargo.weight}</td>
                    <td>${cargo.sender}</td>
                    <td>${cargo.receiver}</td>
        </tr>
      `
      listDiv.appendChild(el);
    });
  }
  
  async function filterByStation() {
    const stationName = document.getElementById('stationInput').value.trim();
    const tbody = document.getElementById('stationTableBody');
    tbody.innerHTML = '';
  
    if (!stationName) {
      alert("Iltimos, stansiya nomini kiriting");
      return;
    }
  
    const { data, error } = await supabase
      .from('trains')
      .select('*, cargo(*)')
      .ilike('departure_station', `%${stationName}%`);


    if (error) {
      tbody.innerHTML = `<tr><td colspan="5">Xatolik: ${error.message}</td></tr>`;
      return;
    }
  
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Bu stansiyaga poyezd topilmadi.</td></tr>`;
      return;
    }
  
    // Ma'lumotlarni foreach bilan ko‘rsatish
    data.forEach(train => {
      let cargoHtml = '';
      if (train.cargo.length > 0) {
        train.cargo.forEach(c => {
          cargoHtml += `${c.cargo_type} (${c.weight}t)<br>`;
        });
      } else {
        cargoHtml = 'Yuk yo‘q';
      }
  
      tbody.innerHTML += `
        <tr>
          <td>${train.train_id}</td>
          <td>${train.train_name}</td>
          <td>${train.departure_station}</td>
          <td>${train.arrival_station}</td>
          <td>${new Date(train.arrival_time).toLocaleString()}</td>
          <td>${cargoHtml}</td>
        </tr>
      `;
    });
  }
  

fetchTrains();
fetchCargo();
