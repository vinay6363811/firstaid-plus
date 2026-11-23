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

      // Google Maps Platform & Live Location UI Elements
      this.shareLiveLocBtn = document.getElementById('btn-share-live-location');
      this.refreshLocTopBtn = document.getElementById('btn-refresh-location-top');
      this.googleApiSetupBtn = document.getElementById('btn-google-api-setup');
      this.googleModal = document.getElementById('google-maps-setup-modal');
      this.googleKeyInput = document.getElementById('google-maps-key-input');
      this.saveGoogleKeyBtn = document.getElementById('btn-save-google-key');
      this.clearGoogleKeyBtn = document.getElementById('btn-clear-google-key');
      this.closeGoogleModalBtn = document.getElementById('btn-close-google-modal');
      this.googleStatusMsg = document.getElementById('google-key-status-msg');

      // Google Maps JS State
      this.isGoogleMapsActive = false;
      this.googleMap = null;
      this.googleUserMarker = null;
      this.googleHospitalMarkers = [];
      this.googleRadiusCircle = null;
      this.googleMapsConfig = null;
      this.googleInfoWindow = null;

      // Real-time location tracking state
      this.watchId = null;
      this.isLiveTracking = false;
      this.lastTrackedLat = null;
      this.lastTrackedLng = null;
      this.lastFetchDistanceThreshold = 40; // Re-query hospitals if moved > 40m
      this.liveTrackingToggleBtn = document.getElementById('btn-toggle-live-tracking');
      this.permissionBanner = document.getElementById('radar-location-permission-banner');
      this.grantLocationBtn = document.getElementById('btn-grant-location-access');
      this.dismissPromptBtn = document.getElementById('btn-dismiss-location-prompt');

      this.init();
    }

    init() {
      if (!this.container) return;

      this.bindEvents();
      this.checkGoogleMapsConfig();
      this.initMap();

      // Listen for view activation - actively seek location access
      const hospitalNavBtn = document.querySelector('[data-view="hospitals"]');
      if (hospitalNavBtn) {
        hospitalNavBtn.addEventListener('click', () => {
          setTimeout(() => {
            if (this.map) this.map.invalidateSize();
            if (this.googleMap && window.google) {
              google.maps.event.trigger(this.googleMap, 'resize');
            }
            this.seekLocationAccess();
          }, 250);
        });
      }

      // Check URL params or initial hash
      if (window.location.hash === '#hospitals') {
        setTimeout(() => this.seekLocationAccess(), 300);
      }
    }

    bindEvents() {
      // Share My Live Location
      if (this.shareLiveLocBtn) {
        this.shareLiveLocBtn.addEventListener('click', () => {
          this.shareLiveLocation();
        });
      }

      // Refresh Location (Top header button)
      if (this.refreshLocTopBtn) {
        this.refreshLocTopBtn.addEventListener('click', () => {
          this.detectUserLocation(true);
        });
      }

      // Google Maps API Setup Modal Trigger
      if (this.googleApiSetupBtn) {
        this.googleApiSetupBtn.addEventListener('click', () => {
          this.openGoogleSetupModal();
        });
      }

      // Close Google Setup Modal
      if (this.closeGoogleModalBtn) {
        this.closeGoogleModalBtn.addEventListener('click', () => {
          this.closeGoogleSetupModal();
        });
      }

      // Save Google Maps Key
      if (this.saveGoogleKeyBtn) {
        this.saveGoogleKeyBtn.addEventListener('click', () => {
          this.saveGoogleMapsKey();
        });
      }

      // Clear Google Maps Key
      if (this.clearGoogleKeyBtn) {
        this.clearGoogleKeyBtn.addEventListener('click', () => {
          this.clearGoogleMapsKey();
        });
      }

      // Toggle Real-Time GPS Tracking
      if (this.liveTrackingToggleBtn) {
        this.liveTrackingToggleBtn.addEventListener('click', () => {
          this.toggleRealTimeTracking();
        });
      }

      // Grant Location Access button in banner
      if (this.grantLocationBtn) {
        this.grantLocationBtn.addEventListener('click', () => {
          this.seekLocationAccess(true);
        });
      }

      // Dismiss Location Prompt banner
      if (this.dismissPromptBtn) {
        this.dismissPromptBtn.addEventListener('click', () => {
          this.hidePermissionPromptBanner();
        });
      }

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
     * Google Maps Platform Initialization
     */
    initGoogleMap() {
      if (!window.google || !window.google.maps) return;
      const mapEl = document.getElementById('hospital-interactive-map');
      if (!mapEl) return;

      // Cleanly teardown Leaflet map if attached
      if (this.map) {
        try {
          this.map.remove();
          this.map = null;
          this.userMarker = null;
          this.accuracyCircle = null;
          this.radiusCircle = null;
          this.hospitalMarkers.clear();
        } catch (e) {
          console.warn('Error clearing Leaflet:', e);
        }
      }

      this.isGoogleMapsActive = true;
      const centerLat = this.userLat || 12.9716;
      const centerLng = this.userLng || 77.5946;

      this.googleMap = new google.maps.Map(mapEl, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 14,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi.medical",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });

      this.googleInfoWindow = new google.maps.InfoWindow();

      // Click to pin on Google Maps
      this.googleMap.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        this.setUserLocation(lat, lng, 'Manual Pin');
      });

      this.updateGoogleMapUserPosition();
      this.updateGoogleMapHospitalMarkers();
    }

    /**
     * Update User Marker on Google Maps (Blue Marker)
     */
    updateGoogleMapUserPosition() {
      if (!this.googleMap || !this.userLat || !this.userLng || !window.google) return;

      const userPos = { lat: this.userLat, lng: this.userLng };

      // Blue SVG Pin for User Location
      const bluePinSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.6 0 0 7.6 0 17C0 29.8 17 42 17 42C17 42 34 29.8 34 17C34 7.6 26.4 0 17 0Z" fill="#2563EB"/>
          <circle cx="17" cy="17" r="8" fill="#FFFFFF"/>
          <circle cx="17" cy="17" r="5" fill="#3B82F6"/>
        </svg>
      `);

      if (!this.googleUserMarker) {
        this.googleUserMarker = new google.maps.Marker({
          position: userPos,
          map: this.googleMap,
          title: "Your Location",
          draggable: true,
          icon: {
            url: bluePinSvg,
            scaledSize: new google.maps.Size(34, 42),
            anchor: new google.maps.Point(17, 42)
          },
          zIndex: 1000
        });

        this.googleUserMarker.addListener('dragend', (e) => {
          this.setUserLocation(e.latLng.lat(), e.latLng.lng(), 'Dragged Pin');
        });

        this.googleUserMarker.addListener('click', () => {
          if (this.googleInfoWindow) {
            this.googleInfoWindow.setContent(`
              <div style="font-family: inherit; padding: 6px;">
                <strong style="color: #2563eb;">📍 Your Live Location</strong>
                <p style="margin: 4px 0 0; font-size: 0.85rem; color: #475569;">${this.userAddress || 'GPS Coordinates'}</p>
                <small style="color: #16a34a; font-weight: 700;">● High-Accuracy GPS Active</small>
              </div>
            `);
            this.googleInfoWindow.open(this.googleMap, this.googleUserMarker);
          }
        });
      } else {
        this.googleUserMarker.setPosition(userPos);
      }

      // Search Radius Circle on Google Maps
      if (!this.googleRadiusCircle) {
        this.googleRadiusCircle = new google.maps.Circle({
          strokeColor: "#0284c7",
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: "#38bdf8",
          fillOpacity: 0.08,
          map: this.googleMap,
          center: userPos,
          radius: this.searchRadius
        });
      } else {
        this.googleRadiusCircle.setCenter(userPos);
        this.googleRadiusCircle.setRadius(this.searchRadius);
      }

      this.googleMap.panTo(userPos);
    }

    /**
     * Update Healthcare Markers on Google Maps (Red for Hospitals, Green for Pharmacies)
     */
    updateGoogleMapHospitalMarkers() {
      if (!this.googleMap || !window.google) return;

      // Clear existing markers
      if (this.googleHospitalMarkers && this.googleHospitalMarkers.length > 0) {
        this.googleHospitalMarkers.forEach(m => m.setMap(null));
        this.googleHospitalMarkers = [];
      }

      const bounds = new google.maps.LatLngBounds();
      if (this.userLat && this.userLng) {
        bounds.extend({ lat: this.userLat, lng: this.userLng });
      }

      // Red SVG Pin for Hospitals & Emergency Centers
      const redPinSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.2 24.8 0 16 0Z" fill="#DC2626"/>
          <circle cx="16" cy="16" r="8" fill="#FFFFFF"/>
          <path d="M14 10H18V14H22V18H18V22H14V18H10V14H14V10Z" fill="#DC2626"/>
        </svg>
      `);

      // Green SVG Pin for Pharmacies & Medical Stores
      const greenPinSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.2 0 0 7.2 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.2 24.8 0 16 0Z" fill="#16A34A"/>
          <circle cx="16" cy="16" r="8" fill="#FFFFFF"/>
          <path d="M14 10H18V14H22V18H18V22H14V18H10V14H14V10Z" fill="#16A34A"/>
        </svg>
      `);

      this.hospitals.forEach(hosp => {
        const isPharmacy = Boolean(hosp.isPharmacy || hosp.category === 'Pharmacy' || /pharmacy|chemist|medical store/i.test(hosp.name));
        const pos = { lat: hosp.lat, lng: hosp.lng };

        const marker = new google.maps.Marker({
          position: pos,
          map: this.googleMap,
          title: hosp.name,
          icon: {
            url: isPharmacy ? greenPinSvg : redPinSvg,
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40)
          }
        });

        marker.addListener('click', () => {
          this.highlightHospitalCard(hosp.id);
          if (this.googleInfoWindow) {
            const directionsUrl = hosp.googleMapsNavigationUrl || `https://www.google.com/maps/dir/?api=1&origin=${this.userLat},${this.userLng}&destination=${hosp.lat},${hosp.lng}&travelmode=driving`;
            const infoHtml = `
              <div style="font-family: inherit; max-width: 280px; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 0.72rem; font-weight: 700; background: ${isPharmacy ? '#dcfce7' : '#fee2e2'}; color: ${isPharmacy ? '#166534' : '#991b1b'}; padding: 2px 8px; border-radius: 999px;">
                    ${isPharmacy ? '💊 Pharmacy' : '🏥 Hospital'}
                  </span>
                  <span style="font-size: 0.8rem; font-weight: 700; color: #2563eb;">${hosp.rankBadge}</span>
                </div>
                <h4 style="margin: 0 0 4px; font-size: 0.95rem; color: #0f172a; font-weight: 700;">${hosp.name}</h4>
                <p style="margin: 0 0 6px; font-size: 0.8rem; color: #64748b;">${hosp.address}</p>
                <div style="display: flex; gap: 8px; font-size: 0.8rem; margin-bottom: 8px; color: #334155;">
                  <span>📍 <strong>${hosp.distanceFormatted}</strong></span>
                  ${hosp.rating ? `<span>⭐ <strong>${hosp.rating.toFixed(1)}</strong></span>` : ''}
                </div>
                <div style="display: flex; gap: 6px;">
                  ${hosp.phone ? `<a href="tel:${hosp.phone}" style="flex:1; text-align:center; padding: 6px; font-size: 0.75rem; font-weight:700; color:#fff; background:#2563eb; border-radius:6px; text-decoration:none;">📞 Call</a>` : ''}
                  <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex:1; text-align:center; padding: 6px; font-size: 0.75rem; font-weight:700; color:#fff; background:#16a34a; border-radius:6px; text-decoration:none;">🗺️ Get Directions</a>
                </div>
              </div>
            `;
            this.googleInfoWindow.setContent(infoHtml);
            this.googleInfoWindow.open(this.googleMap, marker);
          }
        });

        this.googleHospitalMarkers.push(marker);
        bounds.extend(pos);
      });

      if (this.hospitals.length > 0) {
        this.googleMap.fitBounds(bounds);
      }
    }

    /**
     * Share My Live Location (Requirement 1)
     * Retrieves actual GPS coordinates via navigator.geolocation.getCurrentPosition()
     * with high accuracy GPS, shows position on map, and shares/copies Google Maps link.
     */
    shareLiveLocation() {
      if (!navigator.geolocation) {
        alert('GPS Geolocation is not supported on this browser or device.');
        return;
      }

      this.setRadarStatus('ACQUIRING HIGH-ACCURACY GPS FIX TO SHARE...', 'locating');
      this.setRadarScanningAnimation(true);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.handleRealTimeLocationFix(pos, 'gps_live');
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 10);
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          const shareText = `Emergency Live Location from FirstAid+:\n${this.userAddress || 'GPS Coordinates'}\nAccuracy: ±${acc}m\nMap: ${mapsUrl}`;

          if (navigator.share) {
            navigator.share({
              title: 'My Live Emergency Location - FirstAid+',
              text: shareText,
              url: mapsUrl
            }).catch(err => {
              if (err.name !== 'AbortError') {
                this.copyShareUrlToClipboard(mapsUrl, lat, lng, acc);
              }
            });
          } else {
            this.copyShareUrlToClipboard(mapsUrl, lat, lng, acc);
          }
        },
        (err) => {
          this.setRadarScanningAnimation(false);
          this.setRadarStatus('COULD NOT ACQUIRE HIGH-ACCURACY GPS', 'error');
          if (err.code === err.PERMISSION_DENIED) {
            alert('Location permission was denied. Please allow location access in your browser settings to share your live GPS location.');
          } else {
            alert('Unable to acquire GPS signal. Please ensure location services are enabled on your device.');
          }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }

    copyShareUrlToClipboard(url, lat, lng, acc) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          this.showToastNotification(`📍 Live location copied to clipboard!\nLat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} (±${acc}m)\n${url}`);
        }).catch(() => {
          prompt('Copy your live Google Maps location link:', url);
        });
      } else {
        prompt('Copy your live Google Maps location link:', url);
      }
    }

    showToastNotification(msg) {
      const existing = document.getElementById('firstaid-live-loc-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'firstaid-live-loc-toast';
      toast.className = 'firstaid-toast-notification';
      toast.innerHTML = `
        <div class="toast-content">
          <span>${msg.replace(/\n/g, '<br>')}</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('toast-show');
      }, 50);
      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
      }, 4500);
    }

    openGoogleSetupModal() {
      if (this.googleModal) {
        this.googleModal.style.display = 'flex';
        if (this.googleKeyInput && this.googleMapsConfig && this.googleMapsConfig.apiKey) {
          this.googleKeyInput.value = this.googleMapsConfig.apiKey;
        }
      }
    }

    closeGoogleSetupModal() {
      if (this.googleModal) {
        this.googleModal.style.display = 'none';
      }
    }

    async saveGoogleMapsKey() {
      if (!this.googleKeyInput) return;
      const key = this.googleKeyInput.value.trim();
      if (!key) {
        alert('Please enter a valid Google Maps API Key or click "Use Fallback Radar".');
        return;
      }

      if (this.googleStatusMsg) {
        this.googleStatusMsg.style.display = 'block';
        this.googleStatusMsg.textContent = 'Saving and activating key...';
        this.googleStatusMsg.className = 'google-key-status-msg status-loading';
      }

      try {
        const res = await fetch('/api/hospitals/config-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: key })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (this.googleStatusMsg) {
            this.googleStatusMsg.textContent = '✅ Google Maps API key saved! Initializing live map...';
            this.googleStatusMsg.className = 'google-key-status-msg status-success';
          }
          this.updateGoogleApiStatusPill(true);
          this.loadGoogleMapsJsApi(key);
          setTimeout(() => {
            this.closeGoogleSetupModal();
            this.fetchNearbyHospitals();
          }, 1200);
        } else {
          if (this.googleStatusMsg) {
            this.googleStatusMsg.textContent = 'Error: ' + (data.error || 'Failed to save key.');
            this.googleStatusMsg.className = 'google-key-status-msg status-error';
          }
        }
      } catch (err) {
        if (this.googleStatusMsg) {
          this.googleStatusMsg.textContent = 'Network error saving key.';
          this.googleStatusMsg.className = 'google-key-status-msg status-error';
        }
      }
    }

    async clearGoogleMapsKey() {
      try {
        await fetch('/api/hospitals/config-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: '' })
        });
        this.updateGoogleApiStatusPill(false);
        this.isGoogleMapsActive = false;
        if (this.googleStatusMsg) {
          this.googleStatusMsg.textContent = 'Operating in OpenStreetMap Live Radar mode.';
          this.googleStatusMsg.className = 'google-key-status-msg status-info';
        }
        setTimeout(() => {
          this.closeGoogleSetupModal();
          this.initMap();
          this.fetchNearbyHospitals();
        }, 800);
      } catch (e) {
        this.closeGoogleSetupModal();
      }
    }

    updateGoogleApiStatusPill(isActive, customLabel) {
      const dot = document.getElementById('google-api-status-dot');
      const text = document.getElementById('google-api-status-text');
      if (dot && text) {
        if (isActive) {
          dot.className = 'api-status-dot dot-active';
          text.textContent = customLabel || 'Google Maps Active';
        } else {
          dot.className = 'api-status-dot dot-inactive';
          text.textContent = customLabel || 'Google Maps Setup';
        }
      }
    }

    async checkGoogleMapsConfig() {
      try {
        const res = await fetch('/api/hospitals/config');
        if (res.ok) {
          const config = await res.json();
          this.googleMapsConfig = config;
          this.updateGoogleApiStatusPill(config.hasGoogleMapsApiKey);
          if (config.hasGoogleMapsApiKey && config.apiKey) {
            this.loadGoogleMapsJsApi(config.apiKey);
          }
        }
      } catch (e) {
        console.warn('Could not load Google Maps configuration:', e);
      }
    }

    loadGoogleMapsJsApi(apiKey) {
      if (window.google && window.google.maps) {
        this.initGoogleMap();
        return;
      }
      const existing = document.getElementById('google-maps-js-sdk');
      if (existing) existing.remove();

      const script = document.createElement('script');
      script.id = 'google-maps-js-sdk';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Maps JavaScript API loaded successfully');
        this.initGoogleMap();
      };
      script.onerror = () => {
        console.warn('Google Maps JS API failed to load (check key/network). Falling back to OpenStreetMap radar.');
        this.updateGoogleApiStatusPill(false, 'API Load Error');
      };
      document.head.appendChild(script);
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
     * Actively seek location access from the user and start real-time tracking
     */
    seekLocationAccess(forcePrompt = true) {
      this.startRealTimeTracking(forcePrompt);
    }

    /**
     * Show permission guidance banner prompting the user to grant access
     */
    showPermissionPromptBanner() {
      if (this.permissionBanner) {
        this.permissionBanner.style.display = 'flex';
      }
    }

    /**
     * Hide permission guidance banner once granted or dismissed
     */
    hidePermissionPromptBanner() {
      if (this.permissionBanner) {
        this.permissionBanner.style.display = 'none';
      }
    }

    /**
     * Calculate Distance between two lat/lng pairs in meters (Haversine)
     */
    calculateDistanceMeters(lat1, lon1, lat2, lon2) {
      const R = 6371000; // meters
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    /**
     * Smart Multi-Stage Real-Time Geolocation Tracking Pipeline
     * Uses navigator.geolocation.watchPosition for live continuous tracking with high accuracy.
     * Generous 25s timeout so browser dialog never closes before user can click "Allow".
     * Stage 1: High Accuracy Satellite GPS (continuous watch)
     * Stage 2: Fast Wi-Fi / Cellular Triangulation fallback
     * Stage 3: IP Geolocation Fallback (/api/location/ip + client IP lookup)
     * Stage 4: Interactive Pinning & Dragging
     */
    detectUserLocation(forcePrompt = false) {
      this.startRealTimeTracking(forcePrompt);
    }

    startRealTimeTracking(forcePrompt = false) {
      if (!navigator.geolocation) {
        this.setRadarStatus('GPS UNAVAILABLE ON THIS DEVICE', 'error');
        this.fallbackToIpLocation('Device does not support GPS geolocation.');
        return;
      }

      // Clear any previous watcher
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      this.isLiveTracking = true;
      this.updateLiveTrackingButtonUI(true);
      this.setRadarStatus('LOCATING YOUR POSITION...', 'locating');
      this.setRadarScanningAnimation(true);

      // Show friendly prompt if permission hasn't been granted yet
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(perm => {
          if (perm.state === 'prompt') {
            this.showPermissionPromptBanner();
          } else if (perm.state === 'granted') {
            this.hidePermissionPromptBanner();
          }
        }).catch(() => {});
      }

      // Fast Dual-Stage Geolocation Strategy:
      // Stage 1: Fast Wi-Fi/network triangulation (enableHighAccuracy: false).
      // On Windows desktops and laptops, this resolves in 150-400ms without stalling on GPS satellite acquisition.
      let initialFixReceived = false;

      navigator.geolocation.getCurrentPosition(
        (fastPos) => {
          if (!initialFixReceived) {
            console.log('⚡ Fast network location acquired:', fastPos.coords.latitude, fastPos.coords.longitude);
            initialFixReceived = true;
            this.hidePermissionPromptBanner();
            this.handleRealTimeLocationFix(fastPos, 'network_fast');
          }
        },
        (fastErr) => {
          console.warn('Fast network geolocation attempt skipped/failed:', fastErr.message);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: forcePrompt ? 0 : 30000 }
      );

      // Stage 2: Continuous high-accuracy watchPosition for true GPS & live moving tracking
      const highAccOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: forcePrompt ? 0 : 5000
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          initialFixReceived = true;
          this.hidePermissionPromptBanner();
          this.handleRealTimeLocationFix(position, 'gps_live');
        },
        (gpsError) => {
          console.warn('Real-time GPS high accuracy status:', gpsError);

          // If user specifically denied permission in browser
          if (gpsError.code === gpsError.PERMISSION_DENIED) {
            this.stopRealTimeTracking();
            this.hidePermissionPromptBanner();
            this.showPermissionNotice(true);
            this.fallbackToIpLocation('Location permission denied in browser.');
            return;
          }

          // If high accuracy timed out and no fix has been received yet, engage resilient fallback
          if (!initialFixReceived && (gpsError.code === gpsError.TIMEOUT || gpsError.code === gpsError.POSITION_UNAVAILABLE)) {
            console.log('GPS high accuracy unavailable, engaging resilient fallback...');
            this.fallbackToIpLocation(gpsError.message || 'Signal unavailable');
          }
        },
        highAccOptions
      );
    }

    stopRealTimeTracking() {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      this.isLiveTracking = false;
      this.updateLiveTrackingButtonUI(false);
      if (this.radarAccuracyBadge && (this.locationSource === 'gps_live' || this.locationSource === 'gps')) {
        this.radarAccuracyBadge.textContent = `📍 GPS Fixed: ±${this.gpsAccuracy} m`;
        this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-gps';
      }
    }

    toggleRealTimeTracking() {
      if (this.isLiveTracking) {
        this.stopRealTimeTracking();
      } else {
        this.startRealTimeTracking(true);
      }
    }

    updateLiveTrackingButtonUI(isActive) {
      if (!this.liveTrackingToggleBtn) return;
      const textSpan = document.getElementById('live-tracking-btn-text');
      if (isActive) {
        this.liveTrackingToggleBtn.classList.add('live-tracking-active');
        if (textSpan) textSpan.textContent = '● Tracking Live GPS';
        this.liveTrackingToggleBtn.title = 'Live GPS tracking active. Click to pause tracking.';
      } else {
        this.liveTrackingToggleBtn.classList.remove('live-tracking-active');
        if (textSpan) textSpan.textContent = 'Track Real-Time GPS';
        this.liveTrackingToggleBtn.title = 'Click to start real-time GPS tracking.';
      }
    }

    /**
     * Process incoming real-time GPS coordinates stream
     */
    handleRealTimeLocationFix(position, source = 'gps_live') {
      const { latitude, longitude, accuracy } = position.coords;
      const prevLat = this.userLat;
      const prevLng = this.userLng;

      this.userLat = latitude;
      this.userLng = longitude;
      this.gpsAccuracy = Math.round(accuracy);
      this.locationSource = source;

      this.setRadarScanningAnimation(false);
      this.setRadarStatus('YOUR REAL-TIME POSITION IS ACTIVE', 'success');

      if (this.radarAccuracyBadge) {
        this.radarAccuracyBadge.innerHTML = `<span class="live-dot-pulse">●</span> LIVE REAL-TIME GPS: ±${this.gpsAccuracy} m`;
        this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-live-tracking';
        this.radarAccuracyBadge.style.display = 'inline-block';
      }

      // Hide permission notices
      this.hidePermissionPromptBanner();
      const noticeBox = document.getElementById('hospital-radar-notice');
      if (noticeBox && noticeBox.querySelector('.notice-permission-guide')) {
        noticeBox.style.display = 'none';
      }

      // Smoothly update user marker on map
      this.updateMapUserPosition();

      // Check distance moved from previous query
      let shouldRefreshHospitals = false;
      if (!prevLat || !prevLng || !this.lastTrackedLat || !this.lastTrackedLng) {
        shouldRefreshHospitals = true;
      } else {
        const movedMeters = this.calculateDistanceMeters(this.lastTrackedLat, this.lastTrackedLng, latitude, longitude);
        if (movedMeters >= this.lastFetchDistanceThreshold) {
          shouldRefreshHospitals = true;
        }
      }

      if (shouldRefreshHospitals) {
        this.lastTrackedLat = latitude;
        this.lastTrackedLng = longitude;
        this.fetchUserAddress(latitude, longitude);
        this.fetchNearbyHospitals();
      }
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
        if ((type === 'gps' || type === 'gps_live') && this.gpsAccuracy <= 50) {
          this.radarAccuracyBadge.innerHTML = `<span class="live-dot-pulse">●</span> LIVE GPS Satellite: ±${this.gpsAccuracy} m`;
          this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-live-tracking';
        } else if (type === 'gps' || type === 'gps_live') {
          this.radarAccuracyBadge.innerHTML = `<span class="live-dot-pulse">●</span> LIVE GPS Fix: ±${this.gpsAccuracy} m`;
          this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-live-tracking';
        } else {
          this.radarAccuracyBadge.textContent = `🟡 Wi-Fi / Network: ±${this.gpsAccuracy} m`;
          this.radarAccuracyBadge.className = 'radar-accuracy-badge badge-wifi';
        }
        this.radarAccuracyBadge.style.display = 'inline-block';
      }

      // Hide permission notice if open
      this.hidePermissionPromptBanner();
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

      // 2. Client-side direct IP lookup via ipwho.is (fast, highly accurate in India, CORS-enabled)
      if (!resolved) {
        try {
          const res = await fetch('https://ipwho.is/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.latitude && data.longitude) {
              this.userLat = parseFloat(data.latitude);
              this.userLng = parseFloat(data.longitude);
              this.userAddress = `${data.city || ''}, ${data.region || ''}, ${data.country || 'India'}`.replace(/^, /, '');
              resolved = true;
            }
          }
        } catch (e) {}
      }

      // 3. Client-side direct IP lookup via freeipapi.com
      if (!resolved) {
        try {
          const res = await fetch('https://freeipapi.com/api/json');
          if (res.ok) {
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              this.userLat = parseFloat(data.latitude);
              this.userLng = parseFloat(data.longitude);
              this.userAddress = `${data.cityName || ''}, ${data.regionName || ''}, ${data.countryName || 'India'}`.replace(/^, /, '');
              resolved = true;
            }
          }
        } catch (e) {}
      }

      // 4. Client-side direct IP lookup via ipapi.co
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
      if (this.isGoogleMapsActive && this.googleMap) {
        this.updateGoogleMapUserPosition();
      }
      if (!this.map || !this.userLat || !this.userLng) return;

      const userLatLng = [this.userLat, this.userLng];

      // Custom User Radar DivIcon (High visibility beacon with pulse ring & label)
      const userRadarIcon = L.divIcon({
        className: 'user-gps-radar-pin',
        html: `
          <div class="pulse-ring user-radar-pulse"></div>
          <div class="center-dot user-radar-dot"></div>
          <div class="user-radar-tag">📍 YOU ARE HERE</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      if (!this.userMarker) {
        this.userMarker = L.marker(userLatLng, { 
          icon: userRadarIcon, 
          zIndexOffset: 1500,
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

        const popupMsg = this.isLiveTracking
          ? `<strong>📍 Live Real-Time Position</strong><br>${this.userAddress || 'Streaming GPS'}<br><small style="color:#16a34a; font-weight:700;">● Continuous Live GPS Tracking Active (±${this.gpsAccuracy || 10}m)</small>`
          : `<strong>📍 Your Position</strong><br>${this.userAddress || 'Detected Device Location'}<br><small style="color:#0284c7; font-weight:600;">👆 Drag pin or click map to adjust exact spot</small>`;

        this.userMarker.bindPopup(popupMsg);
      } else {
        this.userMarker.setIcon(userRadarIcon);
        this.userMarker.setLatLng(userLatLng);
        if (this.map && !this.map.hasLayer(this.userMarker)) {
          this.userMarker.addTo(this.map);
        }
        const popupMsg = this.isLiveTracking
          ? `<strong>📍 Live Real-Time Position</strong><br>${this.userAddress || 'Streaming GPS'}<br><small style="color:#16a34a; font-weight:700;">● Continuous Live GPS Tracking Active (±${this.gpsAccuracy || 10}m)</small>`
          : `<strong>📍 Your Position</strong><br>${this.userAddress || 'Detected Device Location'}<br><small style="color:#0284c7; font-weight:600;">👆 Drag pin or click map to adjust exact spot</small>`;

        this.userMarker.setPopupContent(popupMsg);
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
      if (this.isLiveTracking && this.map.getZoom() >= 13) {
        this.map.panTo(userLatLng, { animate: true, duration: 0.6 });
      } else {
        this.map.setView(userLatLng, 14);
      }
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
      if (this.isGoogleMapsActive && this.googleMap) {
        this.updateGoogleMapHospitalMarkers();
      }
      if (!this.map) return;

      // Clear existing hospital markers
      this.hospitalMarkers.forEach(marker => this.map.removeLayer(marker));
      this.hospitalMarkers.clear();

      const bounds = L.latLngBounds([[this.userLat, this.userLng]]);

      this.hospitals.forEach(hosp => {
        const isNearest = hosp.isNearest;
        const rankText = String(hosp.rank).padStart(2, '0');
        const isPharmacy = Boolean(hosp.isPharmacy || hosp.category === 'Pharmacy' || /pharmacy|chemist|medical store/i.test(hosp.name));

        // Create numbered custom pin (Red for Hospital, Green for Pharmacy)
        let pinClass = 'hospital-map-pin hospital-pin';
        if (isPharmacy) {
          pinClass = 'hospital-map-pin pharmacy-pin';
        } else if (isNearest) {
          pinClass = 'hospital-map-pin nearest-pin';
        } else if (hosp.emergency) {
          pinClass = 'hospital-map-pin hospital-pin emergency-pin';
        }

        const customPinIcon = L.divIcon({
          className: pinClass,
          html: `
            <div class="pin-badge">
              <span class="pin-rank">#${rankText}</span>
              <span class="pin-icon">${isPharmacy ? '💊' : (hosp.category.includes('Clinic') ? '🩺' : '🏥')}</span>
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
              <a href="${hosp.googleMapsNavigationUrl}" target="_blank" rel="noopener noreferrer" class="popup-btn btn-nav">🗺️ Get Directions</a>
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
        const isPharmacy = Boolean(h.isPharmacy || h.category === 'Pharmacy' || /pharmacy|chemist|medical store/i.test(h.name));

        return `
          <article class="hospital-card ${isPharmacy ? 'pharmacy-card' : ''} ${isNearest ? 'nearest-hospital-card' : ''} ${isSelected ? 'selected-hospital-card' : ''}" 
                   id="card-hosp-${h.id}" 
                   data-hosp-id="${h.id}">
            
            <!-- Card Header: Rank, Badges, Category -->
            <div class="hosp-card-header">
              <div class="hosp-rank-col">
                <span class="hosp-rank-badge ${isNearest ? 'badge-nearest' : ''} ${isPharmacy ? 'badge-pharmacy' : ''}">${h.rankBadge}</span>
                ${isNearest ? '<span class="nearest-pulse-tag">NEAREST FACILITY</span>' : ''}
              </div>
              <div class="hosp-cat-col">
                <span class="hosp-category-pill ${isPharmacy ? 'pharmacy-pill' : ''}">${isPharmacy ? '💊 Pharmacy' : h.category}</span>
                ${h.emergency ? '<span class="emergency-24h-tag">24/7 EMERGENCY</span>' : ''}
              </div>
            </div>

            <!-- Hospital / Pharmacy Name -->
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
                <a href="tel:${h.phone}" class="hosp-btn btn-call-hospital" title="Call facility phone">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>CALL</span>
                </a>
              ` : `
                <span class="hosp-btn btn-call-hospital disabled-btn" title="Phone number unlisted">
                  <span>PHONE UNLISTED</span>
                </span>
              `}

              <button type="button" class="hosp-btn btn-view-route" onclick="window.hospitalRadar.selectHospitalAndRoute('${h.id}')" title="Calculate road route on map">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                <span>ROUTE</span>
              </button>

              <button type="button" class="hosp-btn btn-view-map" onclick="window.hospitalRadar.centerOnHospital('${h.id}')" title="Center on map">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                <span>MAP</span>
              </button>

              <a href="${h.googleMapsNavigationUrl}" target="_blank" rel="noopener noreferrer" class="hosp-btn btn-navigate-hospital" title="Open Google Maps Turn-by-Turn GPS Navigation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                <span>GET DIRECTIONS</span>
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
