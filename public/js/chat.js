// Global Variables
const socket = io();

// DOM Elements
const $sidebar = document.querySelector('#sidebar');
const $messages = document.querySelector('#messages');
const $form = document.querySelector('#form');
const $messageForm = $form.querySelector('#message');
const $formButton = $form.querySelector('button');
const $geoLocationButton = document.querySelector('#geo-location');
const geoLocationLink = document.querySelector('#geo-location-link');

// Templates link-template
const messagesTemplate = document.querySelector('#message-template').innerHTML;
const linksTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Event: Initializing main script
document.addEventListener('DOMContentLoaded', () => {
  socket.on('message', (message) => {
    // console.log(message);

    const html = Mustache.render(messagesTemplate, {
      username: message.user,
      message: message.text,
      createdAt: moment(message.createdAt).format('hh:mm a'),
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
  });
});

socket.on('locationMessage', (message) => {
  // console.log(message);

  const html = Mustache.render(linksTemplate, {
    username: message.user,
    url: message.url,
    createdAt: moment(message.createdAt).format('hh:mm a'),
  });

  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  // console.log(room);
  // console.log(users);

  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html;
});

$form.addEventListener('submit', (e) => {
  e.preventDefault();

  $formButton.setAttribute('disabled', 'disabled');

  // disable
  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    // enable
    $formButton.removeAttribute('disabled');

    $messageForm.value = '';
    $messageForm.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

$geoLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  // disable
  $geoLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        // enable
        $geoLocationButton.removeAttribute('disabled');
        console.log('Location shared');
      }
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
