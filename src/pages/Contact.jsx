import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Contact.css';

const FaqAccordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-accordion">
      {items.map((item, i) => (
        <motion.div 
          key={i} 
          className={`faq-item ${activeIndex === i ? 'active' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <button className="faq-question" onClick={() => toggleAccordion(i)}>
            <span>{item.q}</span>
            <ChevronRight size={20} className={`chevron-icon ${activeIndex === i ? 'rotate' : ''}`} />
          </button>
          <AnimatePresence>
            {activeIndex === i && (
              <motion.div 
                className="faq-answer-wrapper"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              >
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/contact', form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone size={28} />,
      title: 'Call Us',
      details: ['+91 907 4881 551', 'Mon - Sat: 9AM - 7PM'],
      color: 'blue'
    },
    {
      icon: <Mail size={28} />,
      title: 'Email Us',
      details: [ 'infoheedy@gmail.com'],
      color: 'blue'
    },
    {
      icon: <Clock size={28} />,
      title: 'Working Hours',
      details: ['Monday - Friday: 9AM - 8PM', 'Saturday: 10AM - 6PM', 'Sunday: Closed'],
      color: 'blue'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-badge"
          >
            <MessageCircle size={18} />
            <span>Get In Touch</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-title"
          >
            We'd Love to Hear<br />From You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-subtitle"
          >
            Have questions about our products or your order? Our team is here to help you with everything skincare.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="info-grid">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="info-card"
              >
                <div className="info-icon">{info.icon}</div>
                <h3 className="info-title">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="info-detail">{detail}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-centered-wrapper">
            {/* Enquiry Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="form-container centered"
            >
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you within 24 hours.</p>
              </div>
              <form onSubmit={handleSubmit} className="enquiry-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Your Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="spinner"></span>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} />
                      Send Message
                    </span>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-faq"
          >
            <span className="faq-kicker">Support Center</span>
            <h2>Frequently Asked Questions</h2>
            <p>Find quick answers to common questions about our premium skincare experience.</p>
          </motion.div>
          
          <div className="faq-accordion-container">
            <FaqAccordion items={[
              { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express delivery is available for select locations across major cities. Every order is handled with the utmost care to ensure it reaches you in perfect condition.' },
              { q: 'Can I return opened products?', a: 'We accept returns within 30 days of purchase for unopened products in original packaging. Due to hygiene reasons, we cannot accept returns of products that have been used or opened.' },
              { q: 'Are your products cruelty-free?', a: 'Absolutely! All Heedy products are 100% cruelty-free and vegan. We are committed to ethical beauty and never test our formulations on animals.' },
              { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive an email with tracking details. You can also track your order in real-time through your account dashboard under the "My Orders" section.' },
              { q: 'Do you offer personalized skin consultations?', a: 'Yes, our skincare experts are available for virtual consultations to help you build a routine tailored to your skin type and concerns. Contact us through the form above to schedule one.' }
            ]} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
