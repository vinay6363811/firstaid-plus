/**
 * FirstAid+ Module 5: Ambulance Finder & Emergency Transport Assistance (Feature 6)
 * Geospatial ambulance discovery engine connecting users to verified 24/7 public (108/112/102),
 * hospital emergency fleets (Apollo, Fortis, Manipal, BMCRI), and rapid response ICU ambulances.
 */

(function (window) {
  'use strict';

  class AmbulanceFinderController {
    constructor() {
      this.userLat = null;
      this.userLng = null;
      this.ambulances = [];
      this.searchRadius = 15000; // 15 km default for ambulance coverage
      this.isLoading = false;

      // Leaflet Map objects
      this.map = null;
      this.userMarker = null;
      this.ambulanceMarkers = new Map();

      // DOM Elements
      this.container = document.getElementById('view-ambulance');
      this.cardsListContainer = document.getElementById('ambulance-cards-list');
      this.totalCountBadge = document.getElementById('ambulance-total-count');
      this.nearestSummaryBox = document.getElementById('ambulance-nearest-summary');
      this.refreshBtn = document.getElementById('btn-refresh-ambulances');
      this.manualInput = document.getElementById('ambulance-manual-search-input');
      this.manualBtn = document.getElementById('btn-ambulance-manual-search');

      this.init();
    }

    init() {
      if (!this.container) return;
      this.bindEvents();
      this.initMap();

      // View activation listener
      const navBtn = document.querySelector('[data-view="ambulance"]');
      if (navBtn) {
        navBtn.addEventListener('click', () => {
          setTimeout(() => {
            if (this.map) this.map.invalidateSize();
            if (!this.userLat) {
              this.detectLocationAndFindAmbulances();
            }
          }, 300);
        });
      }
    }

    bindEvents() {
      // Refresh Button
      if (this.refreshBtn) {
        this.refreshBtn.addEventListener('click', () => {
          this.detectLocationAndFindAmbulances(true);
        });
      }

      // Manual Location Search
      if (this.manualBtn && this.manualInput) {
        const doSearch = () => {
          const q = this.manualInput.value.trim();
          if (q) this.searchManualLocation(q);
        };
        this.manualBtn.addEventListener('click', doSearch);
        this.manualInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doSearch();
        });
      }
    }

    /**
     * Initialize Leaflet Interactive Map for Ambulance Finder
     */
    initMap() {
      const mapContainer = document.getElementById('ambulance-interactive-map');
      if (!mapContainer || typeof L === 'undefined') return;

      if (!this.map) {
        const defaultLat = this.userLat || 12.9716;
        const defaultLng = this.userLng || 77.5946;

        this.map = L.map('ambulance-interactive-map', {
          center: [defaultLat, defaultLng],
          zoom: 13,
          zoomControl: true
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors | FirstAid+ Ambulances'
        }).addTo(this.map);

        // Click map to change search location
        this.map.on('click', (e) => {
          this.userLat = e.latlng.lat;
          this.userLng = e.latlng.lng;
          this.fetchNearbyAmbulances(this.userLat, this.userLng);
        });
      }
    }

    /**
     * Detect User Location via Cascading GPS
     */
    detectLocationAndFindAmbulances(forceRefresh = false) {
      if (!navigator.geolocation) {
        this.fetchNearbyAmbulances(12.9716, 77.5946);
        return;
      }

      // Stage 1: High accuracy GPS
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.fetchNearbyAmbulances(this.userLat, this.userLng);
        },
        (gpsErr) => {
          // Stage 2: Wi-Fi / Network triangulation
          navigator.geolocation.getCurrentPosition(
            (netPos) => {
              this.userLat = netPos.coords.latitude;
              this.userLng = netPos.coords.longitude;
              this.fetchNearbyAmbulances(this.userLat, this.userLng);
            },
            () => {
              // Stage 3: IP Location fallback
              this.fallbackToIpLocation();
            },
            { enableHighAccuracy: false, timeout: 6000 }
          );
        },
        { enableHighAccuracy: true, timeout: 4500, maximumAge: forceRefresh ? 0 : 300000 }
      );
    }

    async fallbackToIpLocation() {
      try {
        const res = await fetch('/api/location/ip');
        if (res.ok) {
          const data = await res.json();
          if (data && data.lat && data.lng) {
            this.userLat = data.lat;
            this.userLng = data.lng;
            this.fetchNearbyAmbulances(data.lat, data.lng);
            return;
          }
        }
      } catch (e) {}

      this.userLat = 12.9716;
      this.userLng = 77.5946;
      this.fetchNearbyAmbulances(12.9716, 77.5946);
    }

    async searchManualLocation(query) {
      try {
        const res = await fetch(`/api/hospitals/geocode?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.lat && data.lng) {
            this.userLat = data.lat;
            this.userLng = data.lng;
            this.fetchNearbyAmbulances(data.lat, data.lng);
            return;
          }
        }
        alert(`Location "${query}" could not be resolved. Please try another city or landmark.`);
      } catch (e) {
        alert('Could not resolve location. Please check your connection.');
      }
    }

    fetchAmbulances(lat, lng) {
      return this.fetchNearbyAmbulances(lat, lng);
    }

    renderCards() {
      return this.renderAmbulanceCards();
    }

    searchAmbulancesManual(query) {
      return this.searchManualLocation(query);
    }

    /**
     * Query Backend /api/ambulances/nearby
     */
    async fetchNearbyAmbulances(lat, lng) {
      this.userLat = lat;
      this.userLng = lng;
      this.isLoading = true;

      if (this.cardsListContainer) {
        this.cardsListContainer.innerHTML = `
          <div class="ambulance-skeleton">
            <div class="ambulance-siren-loader">🚨</div>
            <p>Scanning surrounding emergency transport network & hospital fleets...</p>
          </div>
        `;
      }

      try {
        const url = `/api/ambulances/nearby?lat=${lat}&lng=${lng}&radius=${this.searchRadius}`;
        const res = await fetch(url);
        const data = await res.json();

        this.isLoading = false;

        if (res.ok && data.ambulances) {
          this.ambulances = data.ambulances;

          if (this.totalCountBadge) {
            this.totalCountBadge.textContent = `${this.ambulances.length} Active Emergency Fleets Nearby`;
          }

          this.updateMap();
          this.renderAmbulanceCards();
          this.renderNearestSummary(data.nearestAmbulance);
        } else {
          this.renderEmptyState(data.error || 'No ambulance fleets found in this area.');
        }
      } catch (err) {
        this.isLoading = false;
        console.error('Error fetching ambulances:', err);
        this.renderEmptyState('Failed to reach emergency dispatch server. Dial 108 or 112 immediately.');
      }
    }

    /**
     * Update Leaflet Map Markers
     */
    updateMap() {
      if (!this.map || !this.userLat || !this.userLng) return;

      const userLatLng = [this.userLat, this.userLng];

      // User Marker
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `<div class="user-gps-radar-pin"><div class="pulse-ring"></div><div class="center-dot"></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!this.userMarker) {
        this.userMarker = L.marker(userLatLng, { icon: userIcon, draggable: true }).addTo(this.map);
        this.userMarker.bindPopup('<strong>📍 Your Emergency Location</strong><br><small style="color:#0284c7;">Drag pin to update ambulance search</small>');
        this.userMarker.on('dragend', (e) => {
          const pt = e.target.getLatLng();
          this.fetchNearbyAmbulances(pt.lat, pt.lng);
        });
      } else {
        this.userMarker.setLatLng(userLatLng);
      }

      // Clear existing markers
      this.ambulanceMarkers.forEach(m => this.map.removeLayer(m));
      this.ambulanceMarkers.clear();

      const bounds = L.latLngBounds([userLatLng]);

      this.ambulances.forEach((amb, idx) => {
        if (!amb.lat || !amb.lng) return;

        const isNearest = idx === 0;
        const ambPin = L.divIcon({
          className: 'amb-map-pin-wrapper',
          html: `
            <div class="amb-pin ${isNearest ? 'nearest-amb-pin' : ''}">
              <span class="amb-pin-icon">🚑</span>
              <span class="amb-pin-rank">${amb.rankBadge}</span>
            </div>
          `,
          iconSize: [38, 44],
          iconAnchor: [19, 44],
          popupAnchor: [0, -40]
        });

        const marker = L.marker([amb.lat, amb.lng], { icon: ambPin }).addTo(this.map);

        marker.bindPopup(`
          <div class="amb-popup-card">
            <span class="amb-popup-badge">${amb.rankBadge} • ${amb.isGovernment ? 'GOVERNMENT 24/7' : 'HOSPITAL FLEET'}</span>
            <h4>${amb.name}</h4>
            <p>📍 ${amb.distanceFormatted} away (${amb.travelTimeFormatted})</p>
            <div class="amb-popup-btns">
              <a href="tel:${amb.phone}" class="popup-btn btn-call">📞 Call ${amb.phone}</a>
              <a href="${amb.directionsUrl}" target="_blank" class="popup-btn btn-nav">🗺️ Route</a>
            </div>
          </div>
        `);

        this.ambulanceMarkers.set(amb.id, marker);
        bounds.extend([amb.lat, amb.lng]);
      });

      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    renderNearestSummary(nearest) {
      if (!this.nearestSummaryBox || !nearest) return;

      this.nearestSummaryBox.innerHTML = `
        <div class="nearest-amb-inner">
          <div class="nearest-amb-top">
            <span class="nearest-star-badge">#01 FASTEST RESPONSE FLEET</span>
            <span class="nearest-eta-tag">⚡ ETA: ${nearest.travelTimeFormatted}</span>
          </div>
          <h3 class="nearest-amb-name">${nearest.name}</h3>
          <p class="nearest-amb-meta">📍 <strong>${nearest.distanceFormatted}</strong> from your position • ${nearest.availability}</p>
          <div class="nearest-amb-actions">
            <a href="tel:${nearest.phone}" class="btn-giant-amb-call">
              📞 IMMEDIATE CALL: ${nearest.phone}
            </a>
            <a href="${nearest.directionsUrl}" target="_blank" class="btn-amb-route">
              🗺️ Navigate
            </a>
          </div>
        </div>
      `;
      this.nearestSummaryBox.style.display = 'block';
    }

    renderAmbulanceCards() {
      if (!this.cardsListContainer) return;

      this.cardsListContainer.innerHTML = this.ambulances.map((amb, idx) => {
        const isNearest = idx === 0;
        const cleanPhone = amb.phone.replace(/[^0-9]/g, '');

        return `
          <div class="ambulance-card ${isNearest ? 'nearest-amb-card' : ''}" id="amb-card-${amb.id}">
            <div class="amb-card-header">
              <div class="amb-rank-col">
                <span class="amb-rank-pill ${isNearest ? 'rank-nearest' : ''}">${amb.rankBadge}</span>
                <span class="amb-type-tag ${amb.isGovernment ? 'tag-govt' : 'tag-hospital'}">
                  ${amb.isGovernment ? '🏛️ ' : '🏥 '}${amb.providerType}
                </span>
              </div>
              <div class="amb-dist-col">
                <span class="amb-dist-badge">📍 ${amb.distanceFormatted}</span>
                <span class="amb-time-badge">⏱️ ${amb.travelTimeFormatted}</span>
              </div>
            </div>

            <h3 class="amb-card-name">${amb.name}</h3>
            <p class="amb-card-address">${amb.address}</p>

            <div class="amb-avail-strip">
              <span class="avail-dot">●</span>
              <span>${amb.availability}</span>
            </div>

            ${amb.equipment && amb.equipment.length > 0 ? `
              <div class="amb-equip-chips">
                ${amb.equipment.slice(0, 3).map(e => `<span class="equip-chip">🛡️ ${e}</span>`).join('')}
              </div>
            ` : ''}

            <div class="amb-card-footer">
              <div class="amb-cost-info">
                <span>${amb.cost || 'Call Dispatch'}</span>
              </div>
              <div class="amb-card-actions">
                <a href="tel:${cleanPhone}" class="btn-amb-card-call">
                  📞 Call ${amb.phone}
                </a>
                <a href="${amb.directionsUrl}" target="_blank" class="btn-amb-card-dir">
                  🗺️ Route
                </a>
                <button type="button" class="btn-amb-card-focus" onclick="window.ambulanceFinder.focusMarker('${amb.id}')">
                  🎯 Map
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    focusMarker(id) {
      const marker = this.ambulanceMarkers.get(id);
      if (marker && this.map) {
        this.map.setView(marker.getLatLng(), 16);
        marker.openPopup();
      }
    }

    renderEmptyState(message) {
      if (!this.cardsListContainer) return;
      this.cardsListContainer.innerHTML = `
        <div class="ambulance-empty-box">
          <div class="empty-icon">🚨</div>
          <h3>${message}</h3>
          <p>In life-threatening situations, dial India's free National Emergency line immediately:</p>
          <div class="emergency-backup-actions">
            <a href="tel:108" class="btn-backup-call-108">🚑 CALL 108 (AMBULANCE)</a>
            <a href="tel:112" class="btn-backup-call-112">🚨 CALL 112 (NATIONAL EMERGENCY)</a>
          </div>
        </div>
      `;
    }
  }

  // Instantiate and expose globally
  document.addEventListener('DOMContentLoaded', () => {
    window.ambulanceFinder = new AmbulanceFinderController();
  });

  window.AmbulanceFinderController = AmbulanceFinderController;

})(window);
