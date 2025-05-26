import { useState, useEffect  } from 'react';
// import { Navbar, Nav, Container, Row, Col, Card, Modal, Button, Alert } from 'react-bootstrap';
import { Navbar, Nav, Container, Row, Col, Card, Modal, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import hero1 from '../assets/image1.jpg';
import hero2 from '../assets/1.jpg'; // Add new images
import hero3 from '../assets/5.jpg';
import hero4 from '../assets/4.jpg';
import logo from '../assets/logo.png';
import {FaHeart, FaRing, FaCameraRetro, FaCalendarAlt, FaCamera, FaGlassCheers } from 'react-icons/fa';

// Add service images
import photo1 from '../assets/photography.jpeg';
import photo2 from '../assets/photography1.jpg';
import photo3 from '../assets/photography2.jpg';
import photo4 from '../assets/photography3.jpg';
import venue1 from '../assets/Marquee.png';
import venue2 from '../assets/marquee.jpg';
import venue3 from '../assets/marquee1.jpg';
import venue4 from '../assets/venue3.jpg';
import car1 from '../assets/car.jpg';
import car2 from '../assets/car1.jpg';
import car3 from '../assets/car3.jpg';
import car4 from '../assets/car4.jpg';
import catering1 from '../assets/catering1.jpg';
import catering2 from '../assets/catering2.jpg';
import catering3 from '../assets/catering.jpg';
import catering4 from '../assets/catering3.jpg';  
import desi from '../assets/desi.jpg'; 
import outdoor from '../assets/outdoor.jpg'; 
import car5 from '../assets/car5.jpg'; 
// Contact image
import contactImage from '../assets/contact.jpg';
// Add reviews data
const reviews = [
  {
    id: 1,
    name: "Ali Khan",
    text: "Excellent service! Made our wedding planning effortless.",
    rating: 5
  },
  {
    id: 2,
    name: "Sara Ahmed",
    text: "Beautiful venues and professional staff. Highly recommended!",
    rating: 4
  },
  {
    id: 3,
    name: "Imran Hashmi",
    text: "Best wedding planners in the city. Thank you!",
    rating: 5
  }
];

const serviceCards = [
  { 
    id: 1,
    image: photo1,
    title: " Premium Photography",
    price: "5200",
    category: "Photography",
    city: "Lahore",
  },
  { 
    id: 2,
    image: photo2,
    title: "Candid Photography",
    price: "7500",
    category: "Photography",
    city: "Karachi"
  },
  { 
    id: 3,
    image: photo3,
    title: "Candid Photography",
    price: "3500",
    category: "Photography",
    city: "Lahore"
  },
  { 
    id: 4,
    image: photo4,
    title: "Candid Photography",
    price: "4000",
    category: "Photography",
    city: "Islamabad"
  },
  { 
    id: 5,
    image: venue1,
    title: "Luxury Banquet Hall",
    price: "50000",
    category: "Venue",
    city:"Karachi"
  },
  { 
    id: 6,
    image: venue2,
    title: "Beachside Venue",
    price: "56500",
    category: "Venue",
    city: "Lahore"
  },
  { 
    id: 7,
    image: venue3,
    title: "Wedding hall",
    price: "30000",
    category: "Venue",
    city: "Karachi"
  },
  { 
    id: 8,
    image: venue4,
    title: "Beachside Venue",
    price: "3500",
    category: "Venue",
    city: "Islamabad"
  },
  { 
    id: 9,
    image: car1,
    title: "Luxury Car Package",
    price: "800",
    category: "CarRental",
    city: "Islamabad"
  },
  { 
    id: 10,
    image: car2,
    title: "Vintage Car Collection",
    price: "1200",
    category: "CarRental",
    city:"Karachi"
  },
  { 
    id: 10,
    image: car3,
    title: "Vintage Car Collection",
    price: "1200",
    category: "CarRental",
    city:"Lahore"
  },
  { 
    id: 10,
    image: car4,
    title: "Vintage Car Collection",
    price: "1200",
    category: "CarRental",
    city:"Islamabad"
  },
  { 
    id: 11,
    image: catering1,
    title: "Premium Catering",
    price: "2500",
    category: "Catering",
    city:"Karachi"
  },
  { 
    id: 12,
    image: catering2,
    title: "International Cuisine",
    price: "3000",
    category: "Catering",
    city:"Lahore"
  },
  { 
    id: 13,
    image: catering3,
    title: "International Cuisine",
    price: "3000",
    category: "Catering",
    city:"Lahore"
  }, { 
    id: 14,
    image: catering4,
    title: "International Cuisine",
    price: "3000",
    category: "Catering",
    city:"Islamabad"
  },
  { 
    id: 15,
    image: outdoor, // Use appropriate image
    title: "Luxury Garden Venue",
    price: "45000",
    category: "Venue",
    city: "Lahore",
    discount: 15
  },
  { 
    id: 16,
    image: car5,
    title: "Premium Car Package",
    price: "2000",
    category: "CarRental",
    city: "Islamabad",
    discount: 20
  },
  { 
    id: 17,
    image: desi,
    title: "Desi Cuisine Package",
    price: "4000",
    category: "Catering",
    city: "Karachi",
    discount: 25
  }
];

const cities = ['All', 'Lahore', 'Karachi', 'Islamabad'];

const Home = () => {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [selectedCities, setSelectedCities] = useState({
    Photography: 'All',
    Venue: 'All',
    Catering: 'All',
    CarRental: 'All'
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  // Inside the Home component
const heroImages = [hero1, hero2, hero3, hero4];
const [currentImageIndex, setCurrentImageIndex] = useState(0);

// Hero slider effect
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  }, 2000); // Faster slide transition
  return () => clearInterval(interval);
}, []);

    // Filter services for each category
    const filterServices = (category) => {
      return serviceCards.filter(service => 
        service.category === category &&   !service.discount && 
        (selectedCities[category] === 'All' || service.city === selectedCities[category])
      );
    };
     // Handle city selection for each category
  const handleCitySelect = (category, city) => {
    setSelectedCities(prev => ({
      ...prev,
      [category]: city
    }));
  };
 // Auto-play slider
 useEffect(() => {
  const interval = setInterval(() => {
    if(autoPlay) {
      setCurrentSlide(prev => (prev + 1) % (serviceCards.length - 2));
    }
  }, 3000);
  return () => clearInterval(interval);
}, [autoPlay, serviceCards.length]);

const currentServices = serviceCards.slice(currentSlide, currentSlide + 3);

  const services = [
    { 
      icon: <FaHeart className="text-purple fs-1" />,
      title: "Wedding Planning",
      description: "Full-service coordination from concept to execution"
    },
    { 
      icon: <FaCalendarAlt className="text-purple fs-1" />,
      title: "Event Management",
      description: "Professional coordination of pre-wedding events"
    },
    { 
      icon: <FaCameraRetro className="text-purple fs-1" />,
      title: "Photography",
      description: "Professional coverage of your special day"
    },
    { 
      icon: <FaGlassCheers className="text-purple fs-1" />,
      title: "Reception Design",
      description: "Create unforgettable wedding experiences"
    }
  ];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
  
      setSubmissionStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmissionStatus(err.message || 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  // Service Section Component
  const ServiceSection = ({ category }) => (
    <section className="py-5 bg-light">
      <Container>
        <h2 className="text-center mb-4 display-4  text-purple">{category}</h2>
        
        {/* City Tabs */}
        <Nav variant="pills" className="justify-content-center mb-4">
          {cities.map(city => (
            <Nav.Item key={city}>
              <Nav.Link
                active={selectedCities[category] === city}
                onClick={() => handleCitySelect(category, city)}
                className="mx-2 rounded-pill"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid',
                  borderColor: selectedCities[category] === city ? '#6f42c1' : 'transparent',
                  color: '#6f42c1',
                  transition: 'all 0.3s ease'
                }}
              >
                {city}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {/* Services Grid */}
        <Row className="g-4">
          {filterServices(category).map(service => (
            <Col key={service.id} lg={3} md={6}>
              <Card className="h-100 border-0 shadow-sm card-hover-effect">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={service.image} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  {service.discount && (
                    <Badge 
                      pill 
                      bg="danger" 
                      className="position-absolute top-0 start-0 m-2"
                    >
                      {service.discount}% OFF
                    </Badge>
                  )}
                </div>
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <div className="mt-auto">
                  <Card.Text className="text-purple ">
                   PKR {service.price}
                  </Card.Text>
                  <Badge bg="secondary">{service.city}</Badge>
                  <div className="d-grid">
                    <Button 
                      variant="purple" 
                      as={Link} 
                      to="/signin"
                      className="rounded-pill mt-4"
                    >
                      View Details
                    </Button>
                  </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
  return (
    <>
     <Navbar  bg="purple" expand="lg" fixed="top" className="shadow-sm" style={{ 
       backgroundColor: '#e2d4f0',
       minHeight: '80px', // Increased height
       transition: 'all 0.3s ease' // Smooth transition for any changes
     }}>
  <Container>
    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
      <img 
        src={logo} 
        alt="WedBricks Logo" 
        style={{ 
          height: '60px', // Slightly increased logo size
          marginRight: '12px',
          
        }} 
      />
     <span 
          className="fw-bold" 
           style={{ 
             color: '#6f42c1', 
             fontSize: '1.5rem',
             fontFamily: 'cursive'
          }}
           >
           WedBrick
          </span> 
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
      <span className="navbar-toggler-icon" style={{ color: 'black' }}></span>
    </Navbar.Toggle>
    
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ms-auto" style={{ gap: '20px' }}>
        <Nav.Link 
          onClick={() => scrollToSection('home')} 
          className="px-2 py-1 text-white"
          style={{ fontSize: '1.1rem' }}
        >
          Home
        </Nav.Link>
        <Nav.Link 
          onClick={() => scrollToSection('services')} 
          className="px-2 py-1 text-white"
          style={{ fontSize: '1.1rem' }}
        >
          Services
        </Nav.Link>
        <Nav.Link 
          onClick={() => scrollToSection('about')} 
          className="px-2 py-1 text-white"
          style={{ fontSize: '1.1rem' }}
        >
          About
        </Nav.Link>
        
        <Nav.Link 
          onClick={() => scrollToSection('contact')} 
          className="px-2 py-1 text-white"
          style={{ fontSize: '1.1rem' }}
        >
          Contact
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/signin" 
          className="px-2 py-1 text-white"
          style={{ fontSize: '1.1rem' }}
        >
          Login
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/signup" 
          className="px-2 py-1 text-white"
          style={{ fontSize: '1.1rem' }}
        >
          Sign Up
        </Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>

      {/* Hero Section */}
      <section 
        id="home"
        className="hero-section position-relative" 
        style={{ 
          backgroundImage:  `url(${heroImages[currentImageIndex]})`,
          backgroundSize: 'cover',
           backgroundPosition: 'center',
           transition: 'background-image 0.5s ease-in-out',
           height:"95vh"
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100" />
        <Container className="py-5 position-relative z-1">
          <Row className="align-items-center  min-vh-100">
            <Col md={8} className="text-purple" style={{color:'white'}}>
              <h1 className="display-3 fw-bold mb-4">Plan Your Perfect Wedding</h1>
              <p className="lead mb-4 fs-4 text-purple fw-bold">Create unforgettable memories with our expert planning services</p>
              <Link to="/signup" className="btn btn-lg px-5 py-3 text-white" style={{ backgroundColor: '#6f42c1' }}>
                Get Started
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

   
     {/* New Services Section */}
     <section id="services" className="py-5 bg-light">
        <Container className="py-5">
          <h2 className="text-center mb-5 display-4 fw-bold text-purple">Our Services</h2>
          <Row className="g-4">
            {services.map((service, index) => (
              <Col key={index} md={6} lg={3} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                  <Card.Body className="text-center p-4">
                    <div className="mb-4">{service.icon}</div>
                    <h3 className="h4 mb-3">{service.title}</h3>
                    <p className="text-muted mb-4">{service.description}</p>
                    <Button 
                      variant="outline-purple" 
                      className="rounded-pill px-4"
                      onClick={() => setShowSignupModal(true)}
                    >
                      Learn More
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          {/* Stats Section */}
          <Row className="mt-5 text-center g-4">
            <Col md={4}>
              <div className="p-4 bg-white rounded-3 shadow-sm">
                <h3 className="text-purple display-4 fw-bold">500+</h3>
                <p className="text-muted mb-0">Successful Events</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-white rounded-3 shadow-sm">
                <h3 className="text-purple display-4 fw-bold">100%</h3>
                <p className="text-muted mb-0">Client Satisfaction</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-white rounded-3 shadow-sm">
                <h3 className="text-purple display-4 fw-bold">15+</h3>
                <p className="text-muted mb-0">Years Experience</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

        <ServiceSection category="Photography" />

{/* Venue Section */}
<ServiceSection category="Venue" />

{/* Car Rental Section */}
<ServiceSection category="CarRental" />

{/* Catering Section */}
<ServiceSection category="Catering" />
    {/* Discount Deals Section */}
    <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 display-4 text-purple">Discount Deals</h2>
          <Row className="g-4">
            {serviceCards.filter(s => s.discount).map(service => (
              <Col key={service.id} lg={3} md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={service.image} 
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Badge 
                      pill 
                      bg="danger" 
                      className="position-absolute top-0 start-0 m-2"
                    >
                      {service.discount}% OFF
                    </Badge>
                  </div>
                  <Card.Body>
                    <Card.Title>{service.title}</Card.Title>
                    <Card.Text className="text-purple fw-bold">
                      {service.price}
                    </Card.Text>
                    <Badge bg="secondary">{service.city}</Badge>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section id="about" className="py-5" style={{ backgroundColor: '#e6e6fa' }}>
        <Container>
          <h2 className="text-center mb-5 text-purple">About Us</h2>
          <p className="lead text-center mb-4">
            We are dedicated to making your wedding planning experience seamless and memorable.
          </p>
          
          <Row className="mt-5">
            <Col md={6}>
              <h3 className="text-purple mb-3">Our Mission</h3>
              <p>
                To provide exceptional wedding planning services that exceed expectations, 
                creating magical moments that couples will cherish for a lifetime.
              </p>
            </Col>
            <Col md={6}>
              <h3 className="text-purple mb-3">Our Vision</h3>
              <p>
                To be the most trusted and innovative wedding planning service worldwide, 
                recognized for our creativity, attention to detail, and personalized approach 
                to each couple's unique love story.
              </p>
            </Col>
          </Row>
          
         
        </Container>
      </section>
        {/* Reviews Section */}
        <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 display-4 text-purple">Client Reviews</h2>
          <Row className="g-4">
            {reviews.map(review => (
              <Col key={review.id} lg={4} md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-3">
                      <div className="rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <Card.Text className="fst-italic">"{review.text}"</Card.Text>
                    <Card.Subtitle className="text-muted">- {review.name}</Card.Subtitle>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-5">
        <Container>
          <h2 className="text-center mb-5 text-purple">Contact Us</h2>
          <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
              <img 
                src={contactImage} 
                alt="Contact us" 
                className="img-fluid rounded-3 shadow-sm"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            </Col>
            <Col md={6} >
              {submissionStatus === 'success' && (
                <Alert variant="success" className="text-center">
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}
              {submissionStatus === 'error' && (
                <Alert variant="danger" className="text-center">
                  There was an error submitting your message. Please try again.
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-purple btn-block"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={6} className="text-center text-md-start">
              <p>&copy; 2025 WedBrick. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="social-icons">
                <a href="#!" className="text-white mx-2"><i className="fab fa-facebook"></i></a>
                <a href="#!" className="text-white mx-2"><i className="fab fa-instagram"></i></a>
                <a href="#!" className="text-white mx-2"><i className="fab fa-twitter"></i></a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Signup Modal */}
      <Modal show={showSignupModal} onHide={() => setShowSignupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sign Up to Continue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You need to create an account to view package details.</p>
          <Link to="/signup" className="btn btn-purple" onClick={() => setShowSignupModal(false)}>
            Go to Sign Up
          </Link>
        </Modal.Body>
      </Modal>

      <style>{`
        .nav-link {
          color: #6f42c1 !important;
          transition: color 0.3s ease;
        }
        .nav-link:hover {
          color: #4b2a8a !important;
          background-color: transparent !important;
        }
          .btn-purple {
  background-color: #6f42c1 !important;
  border-color: #6f42c1 !important;
  color: white !important;
}

.btn-purple:hover {
  background-color: #5a32a3 !important;
  border-color: #5a32a3 !important;
  color: white !important;
}
       
            .hover-shadow-lg {
          transition: all 0.3s ease;
        }
        .hover-shadow-lg:hover {
          transform: translateY(-10px);
          box-shadow: 0 1rem 3rem rgba(111, 66, 193, 0.15) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        
      
            .card-hover-effect {
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .card-hover-effect:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(111, 66, 193, 0.2);
  }
  
 
    /* Card content alignment */
  .card-body-contents {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: calc(100% - 200px); /* Match image height */
  }
  .card-img-container {
    height: 200px;
    overflow: hidden;
  }
        @media (max-width: 992px) {
          .slide-animation {
            transition: none;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
