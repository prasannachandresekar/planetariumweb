document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Theme Toggle Logic
     ========================================================================== */
  const themeToggles = document.querySelectorAll('#themeToggle, #themeToggleMobile');
  const ICON_SUN = 'bi-sun-fill';
  const ICON_MOON = 'bi-moon-stars-fill';

  // Check saved theme or system preference
  const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update all toggle button icons
    themeToggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.classList.remove(ICON_MOON);
          icon.classList.add(ICON_SUN);
        } else {
          icon.classList.remove(ICON_SUN);
          icon.classList.add(ICON_MOON);
        }
      }
    });
  };

  // Initialize Theme
  setTheme(getPreferredTheme());

  // Toggle Theme Event for all toggle buttons
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  });

  /* ==========================================================================
     Back to Top Button
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     Auth Tabs Logic (Login Page)
     ========================================================================== */
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');

  if (authTabs.length > 0) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all
        authTabs.forEach(t => t.classList.remove('active'));
        authForms.forEach(f => f.classList.remove('active'));

        // Add active class to clicked
        tab.classList.add('active');
        const target = tab.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
      });
    });
  }

  /* ==========================================================================
     Ticket Booking Page Logic
     ========================================================================== */
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    const showSelect = document.getElementById('showSelect');
    const datePicker = document.getElementById('datePicker');
    const timeSlots = document.querySelectorAll('.time-slot');
    const selectedTimeInput = document.getElementById('selectedTime');
    const btnBookNow = document.getElementById('btnBookNow');

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    datePicker.min = today;

    // Summary elements
    const summaryShow = document.getElementById('summaryShow');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryTotal = document.getElementById('summaryTotal');
    const totalVisitors = document.getElementById('totalVisitors');

    // Prices
    const PRICES = { adults: 20, children: 12, students: 15 };
    let counts = { adults: 1, children: 0, students: 0 };

    // Make counts available globally for HTML onclick handlers
    window.updateTickets = function (type, delta) {
      if (counts[type] + delta >= 0) {
        counts[type] += delta;

        // Ensure at least 1 visitor total
        if (counts.adults === 0 && counts.children === 0 && counts.students === 0) {
          counts[type] -= delta;
          return;
        }

        // Update input fields
        const inputId = type === 'adults' ? 'adultCount' : (type === 'children' ? 'childCount' : 'studentCount');
        document.getElementById(inputId).value = counts[type];

        updateSummary();
      }
    };

    function updateSummary() {
      // Update show name
      summaryShow.textContent = showSelect.value || 'Select a program';

      // Update Date
      if (datePicker.value) {
        const d = new Date(datePicker.value);
        summaryDate.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        summaryDate.textContent = '-';
      }

      // Update Time
      summaryTime.textContent = selectedTimeInput.value || '-';

      // Update Visitor rows logic
      const totalCount = counts.adults + counts.children + counts.students;
      totalVisitors.textContent = totalCount + (totalCount === 1 ? ' visitor' : ' visitors');
      let totalPrice = 0;

      const parts = ['adults', 'children', 'students'];
      parts.forEach(p => {
        const c = counts[p];
        totalPrice += c * PRICES[p];
        const row = document.getElementById('row' + p.charAt(0).toUpperCase() + p.slice(1));
        if (row) {
          if (c > 0) {
            row.classList.remove('d-none');
            document.getElementById('calc' + p.charAt(0).toUpperCase() + p.slice(1)).textContent = c;
            document.getElementById('price' + p.charAt(0).toUpperCase() + p.slice(1)).textContent = '$' + (c * PRICES[p]).toFixed(2);
          } else {
            row.classList.add('d-none');
          }
        }
      });

      // if adults row missing, update it manually since it is not hidden
      document.getElementById('calcAdults').textContent = counts.adults;
      document.getElementById('priceAdults').textContent = '$' + (counts.adults * PRICES.adults).toFixed(2);

      summaryTotal.textContent = '$' + totalPrice.toFixed(2);

      // Enable/disable form submit styling based on requirements
      if (showSelect.value && datePicker.value && selectedTimeInput.value) {
        btnBookNow.classList.remove('disabled');
      }
    }

    // Event listeners
    showSelect.addEventListener('change', updateSummary);
    datePicker.addEventListener('change', updateSummary);

    timeSlots.forEach(slot => {
      slot.addEventListener('click', (e) => {
        timeSlots.forEach(s => s.classList.remove('selected'));
        e.target.classList.add('selected');
        selectedTimeInput.value = e.target.getAttribute('data-time');
        document.getElementById('timeError').style.display = 'none';
        updateSummary();
      });
    });

    // Initial summary
    updateSummary();

    bookingForm.addEventListener('submit', (e) => {
      if (!selectedTimeInput.value) {
        e.preventDefault();
        document.getElementById('timeError').style.display = 'block';
        return false;
      }
    });
  }

});
