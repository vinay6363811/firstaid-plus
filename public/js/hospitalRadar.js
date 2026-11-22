/**
 * FirstAid+ Module 10: Nearby Hospitals & Emergency Services Radar
 * Advanced geospatial emergency discovery, nearest-to-farthest hospital ranking,
 * live GPS tracking, distance difference intelligence, interactive Leaflet map,
 * and turn-by-turn road routing to verified medical facilities.
 */

(function () {
  'use strict';

  class HospitalRadarController {
    constructor() {
      // State
      this.userLat = null;
      this.userLng = null;
      this.gpsAccuracy = null;
      this.userAddress = null;
      this.hospitals = [];
      this.selectedHospital = null;
      this.searchRadius = 5000; // 5 km default
      this.currentFilter = 'all';
      this.currentSort = 'nearest';
      this.isEmergencyMode = false;
      this.isLoading = false;
      this.activeRoute = null;
      this.routeTravelMode = 'driving';

      // Map & Leaflet objects
      this.map = null;
      this.userMarker = null;
      this.accuracyCircle = null;
      this.radiusCircle = null;
      this.hospitalMarkers = new Map();
      this.routePolyline = null;

      // DOM Elements Cache
      this.container = document.getElementById('view-hospitals');
      this.radarStatusText = document.getElementById('radar-status-text');
      this.radarAccuracyBadge = document.getElementById('radar-accuracy-badge');
      this.radarAddressText = document.getElementById('radar-address-text');
      this.hospitalsListContainer = document.getElementById('hospitals-cards-list');
      this.totalFoundBadge = document.getElementById('radar-total-found');
      this.nearestSummaryCard = document.getElementById('radar-nearest-summary');
      this.secondNearestSummaryCard = document.getElementById('radar-second-nearest-summary');
      this.emergencyFacilitiesBadge = document.getElementById('radar-emergency-count');
      this.refreshGpsBtn = document.getElementById('btn-refresh-gps');
      this.recenterMapBtn = document.getElementById('btn-recenter-map');
      this.manualSearchInput = document.getElementById('hospital-manual-location-input');
      this.manualSearchBtn = document.getElementById('btn-manual-location-search');
      this.hospitalKeywordInput = document.getElementById('hospital-keyword-filter');
      this.radiusSelect = document.getElementById('hospital-radius-select');
      this.emergencyModeToggle = document.getElementById('hospital-emergency-mode-toggle');
      this.emergencyCallBtn = document.getElementById('btn-call-112-hospital');
      this.callNearestBtn = document.getElementById('btn-call-nearest-hospital');
      this.googleMapsFallbackBtn = document.getElementById('btn-open-google-maps-hospitals');
      this.sortSelect = document.getElementById('hospital-sort-select');

      this.init();
    }

    init() {
      if (!this.container) return;

      this.bindEvents();
      this.initMap();

      // Listen for view activation
      const hospitalNavBtn = document.querySelector('[data-view="hospitals"]');
      if (hospitalNavBtn) {
        hospitalNavBtn.addEventListener('click', () => {
          setTimeout(() => {
            if (this.map) this.map.invalidateSize();
            if (!this.userLat) {
              this.detectUserLocation();
            }
          }, 250);
        });
      }

      // Check URL params or initial hash
      if (window.location.hash === '#hospitals') {
        setTimeout(() => this.detectUserLocation(), 300);
      }
    }

    bindEvents() {
      // Refresh GPS
      if (this.refreshGpsBtn) {
        this.refreshGpsBtn.addEventListener('click', () => {
          this.detectUserLocation(true);
        });
      }

      // Recenter Map
      if (this.recenterMapBtn) {
        this.recenterMapBtn.addEventListener('click', () => {
          this.recenterMap();
        });
      }

      // Pin on Map button
      const pinMapBtn = document.getElementById('btn-pin-on-map');
      if (pinMapBtn) {
        pinMapBtn.addEventListener('click', () => {
          this.enablePinPlacementMode();
        });
      }

      // Manual Location Search
      if (this.manualSearchBtn && this.manualSearchInput) {
        const doManualSearch = () => {
          const q = this.manualSearchInput.value.trim();
          if (q) this.searchManualLocation(q);
        };
        this.manualSearchBtn.addEventListener('click', doManualSearch);
        this.manualSearchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doManualSearch();
        });
      }

      // Keyword live filter
      if (this.hospitalKeywordInput) {
        this.hospitalKeywordInput.addEventListener('input', () => {
          this.renderHospitalsList();
        });
      }

      // Radius change
      if (this.radiusSelect) {
        this.radiusSelect.addEventListener('change', () => {
          this.searchRadius = parseInt(this.radiusSelect.value, 10) || 5000;
          this.updateRadiusCircle();
          if (this.userLat && this.userLng) {
            this.fetchNearbyHospitals();
          }
        });
      }

      // Sort Mode change
      if (this.sortSelect) {
        this.sortSelect.addEventListener('change', () => {
          this.currentSort = this.sortSelect.value;
          this.sortHospitals();
          this.renderHospitalsList();
        });
      }

      // Category filter tabs
      const filterBtns = this.container.querySelectorAll('.hospital-filter-chip');
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.currentFilter = btn.getAttribute('data-filter') || 'all';
          this.fetchNearbyHospitals();
        });
      });

      // Emergency Mode Toggle
      if (this.emergencyModeToggle) {
        this.emergencyModeToggle.addEventListener('click', () => {
          this.toggleEmergencyMode();
        });
      }

      // Google Maps direct fallback link
      if (this.googleMapsFallbackBtn) {
        this.googleMapsFallbackBtn.addEventListener('click', () => {
          if (this.userLat && this.userLng) {
            window.open(`https://www.google.com/maps/search/hospitals/@${this.userLat},${this.userLng},14z`, '_blank');
          } else {
            window.open('https://www.google.com/maps/search/hospitals/', '_blank');
          }
        });
      }
    }

    /**
     * Initialize Leaflet Interactive Map
     * Uses OpenStreetMap standard tiles (100% free, no API key required, zero watermarks)
     * with verified MapTiler fallback using user API key.
     */
    initMap() {
      const mapEl = document.getElementById('hospital-interactive-map');
      if (!mapEl || typeof L === 'undefined') return;

      // Prevent duplicate map re-initialization
      if (this.map) {
        this.map.invalidateSize();
        return;
      }

      try {
        // Default center: India center / Bengaluru
        const defaultLat = this.userLat || 12.9716;
        const defaultLng = this.userLng || 77.5946;

        this.map = L.map('hospital-interactive-map', {
          center: [defaultLat, defaultLng],
          zoom: 13,
          zoomControl: true,
          attributionControl: true
        });

        // 1. Primary: Standard OpenStreetMap (OSM) Tiles — Free, clean, zero watermarks
        const osmTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        const maptilerTileUrl = 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=kK2q4Z1TzaZWiJ6A6WGZ';

        this.tileLayer = L.tileLayer(osmTileUrl, {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | FirstAid+'
        });

        // 2. Intelligent Tile Fallback: Switch to MapTiler if OSM rate limits or fails
        let fallbackTriggered = false;
        this.tileLayer.on('tileerror', (e) => {
          console.warn('Standard OSM tile error, engaging verified fallback:', e);
          if (!fallbackTriggered && this.map) {
            fallbackTriggered = true;
            try {
              this.map.removeLayer(this.tileLayer);
              this.tileLayer = L.tileLayer(maptilerTileUrl, {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
              }).addTo(this.map);
            } catch (err) {
              console.error('Error switching to fallback tile layer:', err);
            }
          }
        });

        this.tileLayer.addTo(this.map);

        // Invalidate size once map is attached to DOM to ensure seamless rendering
        setTimeout(() => {
          if (this.map) this.map.invalidateSize();
        }, 150);

        // Listen for map clicks: allows users to click anywhere to set their exact location
        this.map.on('click', (e) => {
          const mapCanvas = document.getElementById('hospital-interactive-map');
          if (mapCanvas) mapCanvas.classList.remove('pin-placement-active');
          this.setUserLocation(e.latlng.lat, e.latlng.lng, 'Manual Pin');
        });
      } catch (err) {
        console.error('Error initializing map:', err);
      }
    }

    /**
     * Retry Map helper in case of network drops
     */
    retryMap() {
      if (this.map) {
        this.map.invalidateSize();
        if (this.tileLayer) {
          this.tileLayer.redraw();
        }
      } else {
        this.initMap();
      }
    }

    /**
     * Enable interactive Pin Placement mode on Map (crosshair cursor & prompt)
     */
    enablePinPlacementMode() {
      if (!this.map) return;
      const mapCanvas = document.getElementById('hospital-interactive-map');
      if (mapCanvas) {
        mapCanvas.classList.add('pin-placement-active');
      }
      this.setRadarStatus('TAP ANYWHERE ON MAP TO PIN YOUR EXACT LOCATION', 'locating');
      const hint = document.getElementById('map-click-hint');
      if (hint) {
        hint.innerHTML = '🎯 <strong>Pin Mode Active:</strong> Tap anywhere on the map now to place your exact pin.';
        hint.classList.add('hint-pulse');
      }
    }

    /**
     * Set User Location interactively (from map click, pin drag, or manual search)
     * Re-centers the radar, updates coordinates, reverse-geocodes street, and queries facilities.
     */
    setUserLocation(lat, lng, sourceLabel = 'Manual Pin') {
      const validLat = parseFloat(lat);
      const validLng = parseFloat(lng);
      if (isNaN(validLat) || isNaN(validLng)) return;

      this.userLat = validLat;
      this.userLng = validLng;
      this.gpsAccuracy = null;
      this.locationSource = 'pinned';

      if (this.accuracyCircle && this.map) {
        this.map.removeLayer(this.accuracyCircle);
        this.accuracyCircle = null;
      }

      this.setRadarScanningAnimation(false);
      this.setRadarStatus('EXACT LOCATION SET ON MAP', 'success');

      if (this.radarAccuracyBadge) {
        this.radarAccuracyBadge.textContent = '📍 Exact Location Pinned';
        this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-pinned';
        this.radarAccuracyBadge.style.display = 'inline-block';
      }

      const hint = document.getElementById('map-click-hint');
      if (hint) {
        hint.innerHTML = '📍 <strong>Exact Location Pinned!</strong> Drag the blue pin or click another spot anytime to change.';
        hint.classList.remove('hint-pulse');
      }

      // Update Map pin and radar circle
      this.updateMapUserPosition();

      if (this.userMarker) {
        this.userMarker.bindPopup(`<strong>📍 Exact Location Set by You</strong><br><small style="color:#0284c7;">Scanning nearest hospitals from this exact spot...</small>`).openPopup();
      }

      // Reverse geocode new coordinates for street/area display
      this.fetchUserAddress(validLat, validLng);

      // Re-fetch nearby medical facilities from this exact point
      this.fetchNearbyHospitals();
    }

    /**
     * Smart Multi-Stage Cascading Geolocation Pipeline
     * Stage 1: High Accuracy Satellite GPS (4500ms timeout)
     * Stage 2: Fast Wi-Fi / Cellular Triangulation (enableHighAccuracy: false, 6000ms timeout)
     * Stage 3: IP Geolocation Fallback (/api/location/ip + client IP lookup)
     * Stage 4: Interactive Pinning & Dragging
     */
    detectUserLocation(forcePrompt = false) {
      if (!navigator.geolocation) {
        this.setRadarStatus('GPS UNAVAILABLE ON THIS DEVICE', 'error');
        this.fallbackToIpLocation('Device does not support GPS geolocation.');
        return;
      }

      this.setRadarStatus('LOCATING YOUR POSITION...', 'locating');
      this.setRadarScanningAnimation(true);

      // Progressive status messages
      setTimeout(() => {
        if (this.isLoading) this.setRadarStatus('IDENTIFYING NEAREST MEDICAL SUPPORT...', 'locating');
      }, 1200);

      setTimeout(() => {
        if (this.isLoading) this.setRadarStatus('SCANNING YOUR SURROUNDINGS...', 'locating');
      }, 2400);

      // Stage 1: Try High-Accuracy Satellite GPS
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handleLocationSuccess(position, 'gps');
        },
        (gpsError) => {
          console.warn('GPS High-accuracy failed/timed out, attempting Wi-Fi/Network triangulation...', gpsError);

          // If user specifically denied permission in browser
          if (gpsError.code === gpsError.PERMISSION_DENIED) {
            this.fallbackToIpLocation('Location permission denied in browser.');
            return;
          }

          // Stage 2: Fast Wi-Fi / Cellular Triangulation (very fast & reliable on laptops/desktops)
          navigator.geolocation.getCurrentPosition(
            (netPosition) => {
              this.handleLocationSuccess(netPosition, 'network');
            },
            (netError) => {
              console.warn('Network triangulation unavailable, engaging IP Geolocation fallback...', netError);
              this.fallbackToIpLocation(netError.message || 'Signal unavailable');
            },
            {
              enableHighAccuracy: false,
              timeout: 6000,
              maximumAge: forcePrompt ? 0 : 60000
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 4500,
          maximumAge: forcePrompt ? 0 : 30000
        }
      );
    }

    /**
     * Handle Successful Browser Geolocation Fix (GPS or Wi-Fi Network)
     */
    handleLocationSuccess(position, type) {
      const { latitude, longitude, accuracy } = position.coords;
      this.userLat = latitude;
      this.userLng = longitude;
      this.gpsAccuracy = Math.round(accuracy);
      this.locationSource = type;

      this.setRadarScanningAnimation(false);
      this.setRadarStatus('YOUR LOCATION IS IDENTIFIED', 'success');

      if (this.radarAccuracyBadge) {
        if (type === 'gps' && this.gpsAccuracy <= 50) {
          this.radarAccuracyBadge.textContent = `🟢 GPS Satellite: ±${this.gpsAccuracy} m`;
          this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-gps';
        } else if (type === 'gps') {
          this.radarAccuracyBadge.textContent = `🟢 GPS Fix: ±${this.gpsAccuracy} m`;
          this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-gps';
        } else {
          this.radarAccuracyBadge.textContent = `🟡 Wi-Fi / Network: ±${this.gpsAccuracy} m`;
          this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-wifi';
        }
        this.radarAccuracyBadge.style.display = 'inline-block';
      }

      // Hide permission notice if open
      const noticeBox = document.getElementById('hospital-radar-notice');
      if (noticeBox && noticeBox.querySelector('.notice-permission-guide')) {
        noticeBox.style.display = 'none';
      }

      // Update Map Position with draggable pin
      this.updateMapUserPosition();

      // Reverse Geocode to display real address
      this.fetchUserAddress(latitude, longitude);

      // Discover Real Hospitals
      this.fetchNearbyHospitals();
    }

    /**
     * Fallback to IP-Based Geolocation when GPS & Wi-Fi are blocked or unavailable
     */
    async fallbackToIpLocation(reason = '') {
      this.setRadarStatus('LOCATING VIA NETWORK IP...', 'locating');

      let resolved = false;

      // 1. Try FirstAid+ Backend IP Geolocation API
      try {
        const res = await fetch('/api/location/ip');
        if (res.ok) {
          const data = await res.json();
          if (data && data.lat && data.lng && !data.isDefault) {
            this.userLat = data.lat;
            this.userLng = data.lng;
            this.userAddress = data.formattedAddress;
            resolved = true;
          }
        }
      } catch (e) {}

      // 2. Client-side direct IP lookup if backend returned default
      if (!resolved) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              this.userLat = parseFloat(data.latitude);
              this.userLng = parseFloat(data.longitude);
              this.userAddress = `${data.city || ''}, ${data.region || ''}, ${data.country_name || 'India'}`.replace(/^, /, '');
              resolved = true;
            }
          }
        } catch (e) {}
      }

      // 3. Fallback to default if offline
      if (!this.userLat || !this.userLng) {
        this.userLat = 12.9716;
        this.userLng = 77.5946;
        this.userAddress = 'Bengaluru City Center (Demo Location)';
      }

      this.setRadarScanningAnimation(false);
      this.gpsAccuracy = null;
      this.locationSource = resolved ? 'ip' : 'demo';

      if (this.radarAddressText) {
        this.radarAddressText.textContent = this.userAddress;
      }
      if (this.radarAccuracyBadge) {
        this.radarAccuracyBadge.textContent = resolved ? '🟠 Estimated Area (Network IP)' : '📍 Demo Center (Tap map to change)';
        this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-approximate';
        this.radarAccuracyBadge.style.display = 'inline-block';
      }

      this.setRadarStatus('APPROXIMATE AREA IDENTIFIED — TAP MAP FOR EXACT SPOT', 'warning');
      this.showPermissionNotice(true);

      this.updateMapUserPosition();
      this.fetchNearbyHospitals();
    }

    /**
     * Show Permission Guidance Banner
     */
    showPermissionNotice(isDenied = false) {
      const noticeBox = document.getElementById('hospital-radar-notice');
      if (!noticeBox) return;

      noticeBox.innerHTML = `
        <div class="radar-notice-content notice-permission-guide">
          <div class="perm-guide-left">
            <span class="perm-guide-icon">📍</span>
            <div>
              <strong>${isDenied ? 'Browser Location Permission Blocked or Unavailable' : 'Exact Location Guidance'}</strong>
              <p>${isDenied 
                ? 'To detect GPS automatically: click the lock icon in your browser URL bar and set Location to "Allow", or <strong>tap anywhere on the map below</strong> to set your exact spot.' 
                : 'Not at the detected spot? <strong>Click anywhere on the map or drag the blue pin</strong> directly onto your building or street.'}</p>
            </div>
          </div>
          <div class="perm-guide-actions">
            <button type="button" class="btn-perm-pin" onclick="window.hospitalRadar.enablePinPlacementMode()">📍 Tap Map to Pin</button>
            <button type="button" class="btn-perm-retry" onclick="window.hospitalRadar.detectUserLocation(true)">🔄 Retry GPS</button>
          </div>
        </div>
      `;
      noticeBox.style.display = 'block';
    }

    /**
     * Manual Location Search: Forward geocodes text query to coordinates
     */
    async searchManualLocation(query) {
      if (!query || query.trim().length === 0) return;

      this.setRadarStatus(`SEARCHING LOCATION: "${query}"...`, 'locating');
      this.setRadarScanningAnimation(true);

      try {
        const res = await fetch(`/api/hospitals/geocode?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        this.setRadarScanningAnimation(false);

        if (res.ok && data.lat && data.lng) {
          this.userLat = data.lat;
          this.userLng = data.lng;
          this.gpsAccuracy = null;
          this.userAddress = data.formattedAddress;

          if (this.radarAddressText) {
            this.radarAddressText.textContent = data.formattedAddress;
          }
          if (this.radarAccuracyBadge) {
            this.radarAccuracyBadge.textContent = 'Manual Location Verified';
            this.radarAccuracyBadge.style.display = 'inline-block';
          }

          this.setRadarStatus('LOCATION IDENTIFIED: ' + query.toUpperCase(), 'success');
          this.updateMapUserPosition();
          this.fetchNearbyHospitals();
        } else {
          this.setRadarStatus(data.error || 'Location could not be found.', 'error');
        }
      } catch (err) {
        this.setRadarScanningAnimation(false);
        this.setRadarStatus('Error resolving location. Please try another area or PIN code.', 'error');
      }
    }

    /**
     * Reverse Geocoding: Fetch real human-readable address
     */
    async fetchUserAddress(lat, lng) {
      try {
        const res = await fetch(`/api/hospitals/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          this.userAddress = data.formattedAddress;
          if (this.radarAddressText) {
            this.radarAddressText.textContent = data.formattedAddress;
          }
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    }

    /**
     * Core Hospital Retrieval: Queries FirstAid+ backend medical radar
     */
    async fetchNearbyHospitals() {
      if (!this.userLat || !this.userLng) return;

      this.isLoading = true;
      this.renderLoadingSkeletons();

      try {
        const url = `/api/hospitals/nearby?lat=${this.userLat}&lng=${this.userLng}&radius=${this.searchRadius}&type=${this.currentFilter}&sort=${this.currentSort}`;
        const res = await fetch(url);
        const data = await res.json();

        this.isLoading = false;

        if (res.ok && data.hospitals) {
          this.hospitals = data.hospitals;

          // Update Summary Dashboard
          this.updateSummaryDashboard(data);

          // Update Map Markers
          this.updateMapHospitalMarkers();

          // Render Cards List
          this.renderHospitalsList();

          // Auto-expand notice if radius was expanded
          if (data.radiusExpanded) {
            this.showRadiusExpansionNotice(data.originalRadiusMeters, data.searchRadiusMeters);
          }
        } else {
          this.renderEmptyState(data.error || 'No medical facilities found in this search radius.');
        }
      } catch (err) {
        this.isLoading = false;
        console.error('Error retrieving hospitals:', err);
        this.renderEmptyState('Unable to reach medical radar server. Please check your connection.');
      }
    }

    /**
     * Update Summary Dashboard metrics at top of screen
     */
    updateSummaryDashboard(data) {
      if (this.totalFoundBadge) {
        this.totalFoundBadge.textContent = `${data.totalFound} Real Facilities Discovered`;
      }

      if (this.emergencyFacilitiesBadge) {
        this.emergencyFacilitiesBadge.textContent = `${data.emergencyFacilitiesCount} Verified 24/7 Trauma Centers`;
      }

      // #01 Nearest Hospital Card
      if (this.nearestSummaryCard && data.nearestHospital) {
        const h = data.nearestHospital;
        this.nearestSummaryCard.innerHTML = `
          <div class="summary-card-inner">
            <span class="summary-rank-badge">#01 NEAREST HOSPITAL</span>
            <h4 class="summary-hosp-name">${h.name}</h4>
            <div class="summary-hosp-meta">
              <span class="summary-distance-highlight">📍 ${h.distanceFormatted} away</span>
              <span class="summary-cat-badge">${h.category}</span>
            </div>
            ${h.phone ? `<a href="tel:${h.phone}" class="summary-quick-call-btn">📞 Call ${h.phone}</a>` : ''}
          </div>
        `;
        this.nearestSummaryCard.style.display = 'block';

        // Connect quick call button in header
        if (this.callNearestBtn && h.phone) {
          this.callNearestBtn.href = `tel:${h.phone}`;
          this.callNearestBtn.style.display = 'inline-flex';
          this.callNearestBtn.querySelector('span').textContent = `Call Nearest: ${h.name.substring(0, 22)}...`;
        }
      }

      // #02 Second Nearest Hospital Card
      if (this.secondNearestSummaryCard && data.secondNearestHospital) {
        const h2 = data.secondNearestHospital;
        this.secondNearestSummaryCard.innerHTML = `
          <div class="summary-card-inner">
            <span class="summary-rank-badge second-nearest">#02 SECOND NEAREST</span>
            <h4 class="summary-hosp-name">${h2.name}</h4>
            <div class="summary-hosp-meta">
              <span class="summary-distance">📍 ${h2.distanceFormatted} away</span>
              <span class="summary-diff-badge">⚡ ${h2.differenceFormatted}</span>
            </div>
          </div>
        `;
        this.secondNearestSummaryCard.style.display = 'block';
      }
    }

    /**
     * Update Leaflet Map with User GPS Position & Radar Circle
     */
    updateMapUserPosition() {
      if (!this.map || !this.userLat || !this.userLng) return;

      const userLatLng = [this.userLat, this.userLng];

      // Custom User Radar DivIcon
      const userRadarIcon = L.divIcon({
        className: 'user-gps-radar-pin',
        html: `
          <div class="user-radar-pulse"></div>
          <div class="user-radar-dot"></div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (!this.userMarker) {
        this.userMarker = L.marker(userLatLng, { 
          icon: userRadarIcon, 
          zIndexOffset: 1000,
          draggable: true,
          autoPan: true
        }).addTo(this.map);

        this.userMarker.on('dragstart', () => {
          if (this.accuracyCircle) {
            this.map.removeLayer(this.accuracyCircle);
            this.accuracyCircle = null;
          }
        });

        this.userMarker.on('dragend', (e) => {
          const pt = e.target.getLatLng();
          this.setUserLocation(pt.lat, pt.lng, 'Dragged Pin');
        });

        this.userMarker.bindPopup(
          `<strong>📍 Your Position</strong><br>${this.userAddress || 'Detected Device Location'}<br><small style="color:#0284c7; font-weight:600;">👆 Drag pin or click map to adjust exact spot</small>`
        );
      } else {
        this.userMarker.setLatLng(userLatLng);
        this.userMarker.setPopupContent(
          `<strong>📍 Your Position</strong><br>${this.userAddress || 'Detected Device Location'}<br><small style="color:#0284c7; font-weight:600;">👆 Drag pin or click map to adjust exact spot</small>`
        );
      }

      // Accuracy circle
      if (this.gpsAccuracy && this.gpsAccuracy > 15) {
        if (!this.accuracyCircle) {
          this.accuracyCircle = L.circle(userLatLng, {
            radius: this.gpsAccuracy,
            color: '#38bdf8',
            weight: 1,
            opacity: 0.5,
            fillColor: '#0284c7',
            fillOpacity: 0.1
          }).addTo(this.map);
        } else {
          this.accuracyCircle.setLatLng(userLatLng);
          this.accuracyCircle.setRadius(this.gpsAccuracy);
        }
      }

      this.updateRadiusCircle();
      this.map.setView(userLatLng, 14);
    }

    /**
     * Update Search Radius Circle on Map
     */
    updateRadiusCircle() {
      if (!this.map || !this.userLat || !this.userLng) return;

      const userLatLng = [this.userLat, this.userLng];
      if (!this.radiusCircle) {
        this.radiusCircle = L.circle(userLatLng, {
          radius: this.searchRadius,
          color: '#00f2fe',
          weight: 1.5,
          dashArray: '6, 6',
          opacity: 0.65,
          fillColor: '#00f2fe',
          fillOpacity: 0.04
        }).addTo(this.map);
      } else {
        this.radiusCircle.setLatLng(userLatLng);
        this.radiusCircle.setRadius(this.searchRadius);
      }
    }

    /**
     * Update Leaflet Map with Numbered Hospital Markers
     */
    updateMapHospitalMarkers() {
      if (!this.map) return;

      // Clear existing hospital markers
      this.hospitalMarkers.forEach(marker => this.map.removeLayer(marker));
      this.hospitalMarkers.clear();

      const bounds = L.latLngBounds([[this.userLat, this.userLng]]);

      this.hospitals.forEach(hosp => {
        const isNearest = hosp.isNearest;
        const rankText = String(hosp.rank).padStart(2, '0');

        // Create numbered custom pin
        const pinClass = isNearest ? 'hospital-map-pin nearest-pin' : 'hospital-map-pin standard-pin';
        const customPinIcon = L.divIcon({
          className: pinClass,
          html: `
            <div class="pin-badge">
              <span class="pin-rank">#${rankText}</span>
              <span class="pin-icon">${hosp.category.includes('Pharmacy') ? '💊' : (hosp.category.includes('Clinic') ? '🩺' : '🏥')}</span>
            </div>
            <div class="pin-arrow"></div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
          popupAnchor: [0, -42]
        });

        const marker = L.marker([hosp.lat, hosp.lng], { icon: customPinIcon }).addTo(this.map);

        // Marker Popup
        const popupContent = `
          <div class="hospital-map-popup">
            <span class="popup-rank">${hosp.rankBadge} ${isNearest ? '• NEAREST' : ''}</span>
            <h4 class="popup-title">${hosp.name}</h4>
            <p class="popup-cat">${hosp.category}</p>
            <p class="popup-addr">${hosp.address}</p>
            <div class="popup-dist-strip">
              <span>📍 ${hosp.distanceFormatted} away</span>
              ${hosp.distanceDiffText ? `<span>⚡ ${hosp.distanceDiffText}</span>` : ''}
            </div>
            <div class="popup-actions">
              ${hosp.phone ? `<a href="tel:${hosp.phone}" class="popup-btn btn-call">📞 Call</a>` : ''}
              <button type="button" class="popup-btn btn-route" onclick="window.hospitalRadar.selectHospitalAndRoute('${hosp.id}')">🧭 Route</button>
              <a href="${hosp.googleMapsNavigationUrl}" target="_blank" class="popup-btn btn-nav">🗺️ Navigate</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Clicking marker scrolls to and highlights corresponding card in list
        marker.on('click', () => {
          this.highlightHospitalCard(hosp.id);
        });

        this.hospitalMarkers.set(hosp.id, marker);
        bounds.extend([hosp.lat, hosp.lng]);
      });

      // Adjust map view to fit user and nearby facilities
      if (this.hospitals.length > 0) {
        this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    /**
     * Render Hospital Cards List (Extreme Nearest-to-Farthest Ranking)
     */
    renderHospitalsList() {
      if (!this.hospitalsListContainer) return;

      const keyword = (this.hospitalKeywordInput ? this.hospitalKeywordInput.value.trim().toLowerCase() : '');
      const displayed = this.hospitals.filter(h => {
        if (!keyword) return true;
        return (
          h.name.toLowerCase().includes(keyword) ||
          h.address.toLowerCase().includes(keyword) ||
          h.category.toLowerCase().includes(keyword) ||
          h.area.toLowerCase().includes(keyword)
        );
      });

      if (displayed.length === 0) {
        this.hospitalsListContainer.innerHTML = `
          <div class="hospital-no-results">
            <p>No facilities match your search keyword "${keyword}".</p>
            <button type="button" class="btn-clear-search" onclick="document.getElementById('hospital-keyword-filter').value=''; window.hospitalRadar.renderHospitalsList();">Clear Search Filter</button>
          </div>
        `;
        return;
      }

      const cardsHtml = displayed.map(h => {
        const isSelected = this.selectedHospital && this.selectedHospital.id === h.id;
        const isNearest = h.isNearest;

        return `
          <article class="hospital-card ${isNearest ? 'nearest-hospital-card' : ''} ${isSelected ? 'selected-hospital-card' : ''}" 
                   id="card-hosp-${h.id}" 
                   data-hosp-id="${h.id}">
            
            <!-- Card Header: Rank, Badges, Category -->
            <div class="hosp-card-header">
              <div class="hosp-rank-col">
                <span class="hosp-rank-badge ${isNearest ? 'badge-nearest' : ''}">${h.rankBadge}</span>
                ${isNearest ? '<span class="nearest-pulse-tag">NEAREST HOSPITAL</span>' : ''}
              </div>
              <div class="hosp-cat-col">
                <span class="hosp-category-pill">${h.category}</span>
                ${h.emergency ? '<span class="emergency-24h-tag">24/7 EMERGENCY</span>' : ''}
              </div>
            </div>

            <!-- Hospital Name -->
            <h3 class="hosp-card-name">${h.name}</h3>

            <!-- Address -->
            <p class="hosp-card-address">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${h.address}</span>
            </p>

            <!-- Distance Intelligence Strip (Section 4) -->
            <div class="hosp-distance-intelligence-box">
              <div class="distance-metric-item">
                <span class="metric-label">Distance from your location:</span>
                <span class="metric-value straight-distance">📍 ${h.distanceFormatted}</span>
              </div>

              ${h.roadDistance ? `
                <div class="distance-metric-item">
                  <span class="metric-label">Road distance:</span>
                  <span class="metric-value road-distance">🚗 ${h.roadDistance}</span>
                </div>
                <div class="distance-metric-item">
                  <span class="metric-label">Estimated travel time:</span>
                  <span class="metric-value travel-time">⏱️ ${h.travelTime}</span>
                </div>
              ` : ''}

              ${h.distanceDiffText ? `
                <div class="distance-metric-item distance-diff-strip">
                  <span class="metric-label">Distance difference:</span>
                  <span class="metric-value diff-value">⚡ ${h.distanceDiffText}</span>
                </div>
              ` : ''}
            </div>

            <!-- Operating Status & Reviews -->
            <div class="hosp-status-row">
              <span class="hosp-open-badge ${h.isOpen ? 'status-open' : 'status-unverified'}">
                ● ${h.openNowText || 'Hours on file'}
              </span>
              ${h.rating ? `
                <span class="hosp-rating-badge">
                  ⭐ ${h.rating.toFixed(1)} (${h.userRatingsTotal || 0} reviews)
                </span>
              ` : ''}
            </div>

            <!-- Action Buttons Grid -->
            <div class="hosp-card-actions">
              ${h.phone ? `
                <a href="tel:${h.phone}" class="hosp-btn btn-call-hospital" title="Call hospital telephone">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>CALL HOSPITAL</span>
                </a>
              ` : `
                <span class="hosp-btn btn-call-hospital disabled-btn" title="Phone number unlisted">
                  <span>PHONE UNLISTED</span>
                </span>
              `}

              <button type="button" class="hosp-btn btn-view-route" onclick="window.hospitalRadar.selectHospitalAndRoute('${h.id}')" title="Calculate road route on map">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                <span>CALCULATE ROUTE</span>
              </button>

              <button type="button" class="hosp-btn btn-view-map" onclick="window.hospitalRadar.centerOnHospital('${h.id}')" title="Center on map">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                <span>VIEW ON MAP</span>
              </button>

              <a href="${h.googleMapsNavigationUrl}" target="_blank" rel="noopener noreferrer" class="hosp-btn btn-navigate-hospital" title="Open Google Maps Turn-by-Turn GPS Navigation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                <span>NAVIGATE</span>
              </a>
            </div>

          </article>
        `;
      }).join('');

      this.hospitalsListContainer.innerHTML = cardsHtml;
    }

    /**
     * Center on Hospital Marker & Open its Popup
     */
    centerOnHospital(hospId) {
      const hosp = this.hospitals.find(h => h.id === hospId);
      if (!hosp || !this.map) return;

      this.map.setView([hosp.lat, hosp.lng], 16, { animate: true });
      const marker = this.hospitalMarkers.get(hospId);
      if (marker) {
        marker.openPopup();
      }

      this.highlightHospitalCard(hospId);
    }

    /**
     * Highlight Card in list and scroll smoothly into view
     */
    highlightHospitalCard(hospId) {
      const cards = this.container.querySelectorAll('.hospital-card');
      cards.forEach(c => c.classList.remove('selected-hospital-card'));

      const targetCard = document.getElementById(`card-hosp-${hospId}`);
      if (targetCard) {
        targetCard.classList.add('selected-hospital-card');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    /**
     * Exact Route Generation (Section 7): Guides the user to the actual hospital
     */
    async selectHospitalAndRoute(hospId, mode = null) {
      const hosp = this.hospitals.find(h => h.id === hospId);
      if (!hosp || !this.userLat || !this.userLng) return;

      this.selectedHospital = hosp;
      if (mode) this.routeTravelMode = mode;

      this.centerOnHospital(hospId);

      try {
        const url = `/api/hospitals/route?startLat=${this.userLat}&startLng=${this.userLng}&destLat=${hosp.lat}&destLng=${hosp.lng}&mode=${this.routeTravelMode}`;
        const res = await fetch(url);
        const routeData = await res.json();

        if (res.ok && routeData.success) {
          // Update hospital data with exact road metrics
          hosp.roadDistance = routeData.roadDistanceFormatted;
          hosp.travelTime = routeData.travelTimeFormatted;

          // Render route polyline on map
          if (routeData.coordinates && routeData.coordinates.length > 0 && this.map) {
            if (this.routePolyline) {
              this.map.removeLayer(this.routePolyline);
            }

            // GeoJSON coordinates are [lng, lat], Leaflet polyline expects [lat, lng]
            const latLngs = routeData.coordinates.map(pt => [pt[1], pt[0]]);
            this.routePolyline = L.polyline(latLngs, {
              color: '#00f2fe',
              weight: 5,
              opacity: 0.85,
              lineJoin: 'round',
              dashArray: null
            }).addTo(this.map);

            this.map.fitBounds(this.routePolyline.getBounds(), { padding: [60, 60] });
          }

          // Show floating route active bar
          this.showRouteActiveOverlay(hosp, routeData);

          // Re-render card to display road distance and travel time
          this.renderHospitalsList();
        }
      } catch (err) {
        console.error('Error generating route:', err);
      }
    }

    /**
     * Floating Route Active Overlay Banner
     */
    showRouteActiveOverlay(hosp, routeData) {
      let overlay = document.getElementById('hospital-route-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'hospital-route-overlay';
        overlay.className = 'hospital-route-overlay';
        this.container.querySelector('.hospital-map-wrapper').appendChild(overlay);
      }

      overlay.innerHTML = `
        <div class="route-overlay-content">
          <div class="route-header">
            <span class="route-tag">ROAD ROUTE ACTIVE</span>
            <button type="button" class="btn-close-route" onclick="window.hospitalRadar.clearActiveRoute()">✕ Close Route</button>
          </div>
          <h4 class="route-dest-name">${hosp.name}</h4>
          <div class="route-metrics-bar">
            <span>🚗 Road: <strong>${routeData.roadDistanceFormatted}</strong></span>
            <span>⏱️ Time: <strong>${routeData.travelTimeFormatted}</strong></span>
            <span>Mode: <strong>${this.routeTravelMode.toUpperCase()}</strong></span>
          </div>
          <div class="route-actions-row">
            <a href="${hosp.googleMapsNavigationUrl}" target="_blank" rel="noopener noreferrer" class="btn-launch-nav-large">
              🧭 NAVIGATE TO THIS HOSPITAL IN GOOGLE MAPS
            </a>
          </div>
        </div>
      `;
      overlay.style.display = 'block';
    }

    /**
     * Clear Active Route Polyline and Overlay
     */
    clearActiveRoute() {
      if (this.routePolyline && this.map) {
        this.map.removeLayer(this.routePolyline);
        this.routePolyline = null;
      }
      const overlay = document.getElementById('hospital-route-overlay');
      if (overlay) overlay.style.display = 'none';
      this.selectedHospital = null;
      this.recenterMap();
    }

    /**
     * Smart Emergency Mode (Section 11)
     */
    toggleEmergencyMode(forceState = null) {
      this.isEmergencyMode = (forceState !== null) ? forceState : !this.isEmergencyMode;
      this.container.classList.toggle('emergency-mode-active', this.isEmergencyMode);

      if (this.emergencyModeToggle) {
        this.emergencyModeToggle.classList.toggle('active', this.isEmergencyMode);
        const label = this.emergencyModeToggle.querySelector('span');
        if (label) {
          label.textContent = this.isEmergencyMode ? '🚨 Emergency Mode: ACTIVE' : '🚨 Emergency Mode: OFF';
        }
      }

      // In emergency mode, filter directly to emergency trauma hospitals
      if (this.isEmergencyMode) {
        this.currentFilter = 'emergency';
        const emergencyTab = this.container.querySelector('[data-filter="emergency"]');
        if (emergencyTab) {
          this.container.querySelectorAll('.hospital-filter-chip').forEach(b => b.classList.remove('active'));
          emergencyTab.classList.add('active');
        }
      } else {
        this.currentFilter = 'all';
        const allTab = this.container.querySelector('[data-filter="all"]');
        if (allTab) {
          this.container.querySelectorAll('.hospital-filter-chip').forEach(b => b.classList.remove('active'));
          allTab.classList.add('active');
        }
      }

      this.fetchNearbyHospitals();
    }

    /**
     * Recenter Map on User GPS Position
     */
    recenterMap() {
      if (!this.map || !this.userLat || !this.userLng) return;
      this.map.setView([this.userLat, this.userLng], 14, { animate: true });
      if (this.userMarker) this.userMarker.openPopup();
    }

    setRadarStatus(text, stateClass = 'idle') {
      if (this.radarStatusText) {
        this.radarStatusText.textContent = text;
        this.radarStatusText.className = 'radar-status-text ' + stateClass;
      }
    }

    setRadarScanningAnimation(isScanning) {
      const radarScanner = document.getElementById('hospital-radar-scanner');
      if (radarScanner) {
        radarScanner.classList.toggle('active-scanning', isScanning);
      }
    }

    showRadiusExpansionNotice(originalR, expandedR) {
      const noticeBox = document.getElementById('hospital-radar-notice');
      if (noticeBox) {
        noticeBox.innerHTML = `
          <div class="radar-notice-content">
            <span>ℹ️ Automatically expanded search radius from ${(originalR / 1000).toFixed(0)} km to ${(expandedR / 1000).toFixed(0)} km to discover comprehensive medical facilities.</span>
          </div>
        `;
        noticeBox.style.display = 'block';
        setTimeout(() => { noticeBox.style.display = 'none'; }, 8000);
      }
    }

    showManualSearchNotice(msg) {
      const noticeBox = document.getElementById('hospital-radar-notice');
      if (noticeBox) {
        noticeBox.innerHTML = `
          <div class="radar-notice-content notice-warning">
            <span>⚠️ ${msg}</span>
          </div>
        `;
        noticeBox.style.display = 'block';
      }
    }

    renderLoadingSkeletons() {
      if (!this.hospitalsListContainer) return;
      this.hospitalsListContainer.innerHTML = Array(3).fill(0).map(() => `
        <div class="hospital-card-skeleton">
          <div class="skeleton-line line-header"></div>
          <div class="skeleton-line line-title"></div>
          <div class="skeleton-line line-text"></div>
          <div class="skeleton-line line-actions"></div>
        </div>
      `).join('');
    }

    renderEmptyState(message) {
      if (!this.hospitalsListContainer) return;
      this.hospitalsListContainer.innerHTML = `
        <div class="hospital-no-results">
          <div class="empty-icon">🏥</div>
          <h3>${message}</h3>
          <p>Try selecting a larger search radius (e.g. 20 km or 50 km) or enter a manual landmark or PIN code above.</p>
          <button type="button" class="btn-expand-radius" onclick="document.getElementById('hospital-radius-select').value='20000'; document.getElementById('hospital-radius-select').dispatchEvent(new Event('change'));">
            Expand Radius to 20 km
          </button>
        </div>
      `;
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.hospitalRadar = new HospitalRadarController();
    });
  } else {
    window.hospitalRadar = new HospitalRadarController();
  }

  // Global helper for opening hospital radar from symptom triage results
  window.openHospitalRadar = function (emergencyReason = null) {
    const hospitalNavBtn = document.querySelector('[data-view="hospitals"]');
    if (hospitalNavBtn) {
      hospitalNavBtn.click();
    }
    if (window.hospitalRadar) {
      if (emergencyReason) {
        window.hospitalRadar.toggleEmergencyMode(true);
      }
      setTimeout(() => {
        window.hospitalRadar.detectUserLocation();
      }, 300);
    }
  };
})();
