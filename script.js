'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    // this.date=...
    // this.id=...
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDesciption() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.desciption = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }  ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}
class Running extends workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.clacPace();
    this._setDesciption();
  }
  clacPace() {
    this.Pace = this.duration / this.distance;
    return this.Pace;
  }
}
class Cycling extends workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.clacPace();
    this._setDesciption();
  }
  clacPace() {
    this.Pace = this.duration / this.distance;
    return this.Pace;
  }
}
// const run1= new Running([39,-12]);

// let map, mapEvent;

// implementing the class of mehtods --------------------------
class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 14;
  #workouts = [];
  constructor() {
    // get user position ------------
    this._getPosition();

    // get data from local storage
    this._getLocalStorage();
    // attach events ,-------------
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Elevation/cadence  display form--------------

    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }
  // ----------------------------------------------------
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('how the fuck would i get your location BITCH!!!');
        }
      );
  }
  // --------------------------------------------------------------

  _loadMap(position) {
    console.log(position);

    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.pt/maps/@${longitude},${latitude}`);
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handling clicks on map -------------------

    this.#map.on('click', this._showForm.bind(this));
  }
  // ---------------------------------------------------------------
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideMap() {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  // ---------------------------------------------------------------
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  // ---------------------------------------------------------------
  _newWorkout(e) {
    //  console.log(mapEvent);
    e.preventDefault();
    const ValidInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const PositiveInputs = (...inputs) => inputs.every(inp => inp > 0);

    // get Data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    let workout;
    const { lat, lng } = this.#mapEvent.latlng;

    // if act running create run
    if (type === 'running') {
      // check if date is valid

      if (
        !ValidInputs(distance, cadence, duration) &&
        PositiveInputs(distance, cadence, duration)
      )
        return alert('only numbers mohter fucker ');
      workout = new Running([lat, lng], distance, duration, cadence);
      console.log(' this is ');
      console.log(workout);
    }

    // if act cycling create one
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // check if date is valid
      if (
        !ValidInputs(distance, cadence, duration) &&
        PositiveInputs(distance, cadence, duration)
      )
        return alert('only numbers mohter fucker ');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);
    console.log(this.#workouts);

    // render workout on map as marker
    this._renderWorkoutMarker(workout);
    // render workout on list
    this._renderWorkout(workout);
    // hide form + clear inputs fields
    this._hideMap();

    // clear input fields-----------
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    // set local storage to all workouts
    this._setLocalStorage();
  }
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxwidth: 250,
          minwidth: 100,
          autoclose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type} on ${workout.desciption}`)
      .openPopup();
  }
  _renderWorkout(workout) {
    console.log(workout);
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
          <h2 class="workout__title"> ${workout.desciption}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}
        </span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
    // case it is running ----------------
    if (workout.type === 'running') {
      html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.Pace} </span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence} </span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
          `;
    }
    if (workout.type === 'cycling') {
      html += `
           <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.Pace.toFixed(1)} </span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain} </span>
            <span class="workout__unit">m</span>
          </div>
        </li> -->
          `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  // ----------------------------------------------------
  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // workout.click();
  }
  // --------------------------
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  // --------------------------------
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  reset(){
    localStorage.removeItem('workouts');
    location.reload();
  }
}
console.log('amed');

// ---------------------------------------------------------------
const app = new App();
