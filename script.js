const menuToggle = document.querySelector('.menu-toggle');
const primaryNavigation = document.querySelector('#primary-navigation');

function closeNavigation() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  primaryNavigation.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
  primaryNavigation.classList.toggle('is-open', !isExpanded);
});

primaryNavigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeNavigation();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  if (menuToggle.getAttribute('aria-expanded') === 'true' &&
      !primaryNavigation.contains(event.target) &&
      !menuToggle.contains(event.target)) {
    closeNavigation();
  }
});

const enquiryForm = document.querySelector('#enquiry-form');
const formStatus = document.querySelector('#form-status');
const submitButton = enquiryForm.querySelector('[type="submit"]');

function showFormStatus(message, state, enquiryText = '') {
  formStatus.replaceChildren();
  formStatus.className = `form-status${state ? ` is-${state}` : ''}`;
  formStatus.append(document.createTextNode(message));

  if (enquiryText) {
    const fallbackLink = document.createElement('a');
    fallbackLink.href = `https://wa.me/918287023474?text=${encodeURIComponent(enquiryText)}`;
    fallbackLink.target = '_blank';
    fallbackLink.rel = 'noopener noreferrer';
    fallbackLink.textContent = ' Send it on WhatsApp.';
    formStatus.append(fallbackLink);
  }
}

enquiryForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!enquiryForm.reportValidity()) return;

  const formData = new FormData(enquiryForm);
  const endpoint = enquiryForm.getAttribute('action').trim();
  const enquiryText = [
    'Hello Day Night Security, I would like to request a quote.',
    '',
    `Name: ${formData.get('name')}`,
    `Phone Number: ${formData.get('phone')}`,
    `Email: ${formData.get('email')}`,
    `Service Required: ${formData.get('service')}`,
    `Message: ${formData.get('message')}`
  ].join('\n');

  if (endpoint.includes('YOUR_FORMSPREE_FORM_ID')) {
    showFormStatus('Email delivery is not configured yet. Replace the Formspree form ID in this form action after activating your form.', 'error', enquiryText);
    return;
  }

  if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint)) {
    showFormStatus('The form endpoint is not a valid Formspree URL. Please contact us directly or try WhatsApp.', 'error', enquiryText);
    return;
  }

  submitButton.disabled = true;
  enquiryForm.setAttribute('aria-busy', 'true');
  showFormStatus('Sending your enquiry…', 'loading');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Formspree returned HTTP ${response.status}`);
    }

    showFormStatus('Your enquiry was submitted successfully. Day Night Security will receive it through the configured form.', 'success');
    enquiryForm.reset();
  } catch (error) {
    console.error('Enquiry submission failed:', error);
    showFormStatus('We could not submit your enquiry. Please try again or contact us on WhatsApp.', 'error', enquiryText);
  } finally {
    submitButton.disabled = false;
    enquiryForm.removeAttribute('aria-busy');
  }
});

const contactSections = [document.querySelector('#contact'), document.querySelector('.site-footer')].filter(Boolean);
if ('IntersectionObserver' in window && contactSections.length) {
  const visibleContactSections = new Set();
  const contactVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleContactSections.add(entry.target);
      else visibleContactSections.delete(entry.target);
    });
    document.body.classList.toggle('contact-active', visibleContactSections.size > 0);
  }, { threshold: 0.12 });
  contactSections.forEach((section) => contactVisibilityObserver.observe(section));
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready');
  const animatedElements = document.querySelectorAll('.intro-grid, .about-grid, .service-card, .benefit, .visual-cta-content, .contact-grid');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  animatedElements.forEach((element) => {
    element.classList.add('reveal');
    revealObserver.observe(element);
  });
}
