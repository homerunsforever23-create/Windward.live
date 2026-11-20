/* Windward Properties — Google Maps (locations section)
   Part of windward.live. Loaded by index.html. */

const WINDWARD_LOCATIONS = [
  { lat: 40.6856, lng: -75.4970, title: 'Carriage House', address: '1796 Main St, Northampton, PA', num: 1 },
  { lat: 40.68711090000001, lng: -75.4983839, title: 'The Barn Apartments', address: '1775 Franklin St, Northampton, PA', num: 2 },
  { lat: 40.7480556, lng: -75.61127479999999, title: 'Windward on the Green', address: '917 Main St, Walnutport, PA', num: 3 }
];

let windwardMap, windwardMarkers = [], windwardInfoWindows = [];

function initWindwardMap() {
  const bounds = new google.maps.LatLngBounds();
  windwardMap = new google.maps.Map(document.getElementById('windward-map'), {
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a0c4e4' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f0f6ff' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#d4e4f7' }] },
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#0b1f3a' }] }
    ]
  });

  WINDWARD_LOCATIONS.forEach((loc, i) => {
    const pos = { lat: loc.lat, lng: loc.lng };
    bounds.extend(pos);

    const marker = new google.maps.Marker({
      position: pos,
      map: windwardMap,
      title: loc.title,
      label: {
        text: String(loc.num),
        color: 'white',
        fontWeight: 'bold',
        fontSize: '13px',
        fontFamily: 'Nunito, sans-serif'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 18,
        fillColor: '#2563a8',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family:Nunito,sans-serif;padding:0.4rem 0.2rem;min-width:180px;">
          <div style="font-weight:800;font-size:0.95rem;color:#0b1f3a;margin-bottom:0.3rem;">${loc.title}</div>
          <div style="font-size:0.8rem;color:#64748b;">📍 ${loc.address}</div>
        </div>`
    });

    marker.addListener('click', () => {
      windwardInfoWindows.forEach(iw => iw.close());
      infoWindow.open(windwardMap, marker);
      windwardMap.panTo(pos);
      windwardMap.setZoom(16);
      setActiveCard(i);
    });

    windwardMarkers.push(marker);
    windwardInfoWindows.push(infoWindow);
  });

  windwardMap.fitBounds(bounds);
}

function focusPin(i) {
  if (!windwardMap) return;
  windwardInfoWindows.forEach(iw => iw.close());
  windwardInfoWindows[i].open(windwardMap, windwardMarkers[i]);
  windwardMap.panTo(windwardMarkers[i].getPosition());
  windwardMap.setZoom(16);
  setActiveCard(i);
}

function setActiveCard(i) {
  document.querySelectorAll('.loc-card').forEach((c, idx) => {
    c.classList.toggle('active-card', idx === i);
  });
}

// Load Google Maps API
(function() {
  const s = document.createElement('script');
  s.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBRjrEX2MweIkoHHnIHgOXeGmYJKLFD9GI&callback=initWindwardMap';
  s.async = true; s.defer = true;
  document.head.appendChild(s);
})();
