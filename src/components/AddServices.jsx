import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const AddService = () => {
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    category: '',
    location: '',
    address: '',
    description: '',
    images: [], // Already updated for multiple images
    cuisineType: '',
    menuItems: '',
    serviceType: '',
    minGuests: '',
    maxGuests: '',
    availabilityDates: '',
    additionalServices: [],
    additionalServicesOther: '',
    customizationOptions: '',
    termsConditions: '',
    photographyType: '',
    packageDetails: '',
    numPhotographers: '',
    coverageDuration: '',
    albumEditing: '',
    deliveryTime: '',
    portfolio: [], // Changed from 'null' to '[]' to store multiple files
    additionalPhotographyServices: [],
    additionalPhotographyServicesOther: '',
    capacityMin: '',
    capacityMax: '',
    hallTypes: [],
    pricingStructure: '',
    availablePackages: '',
    decorServices: '',
    cateringIncluded: '',
    parkingAvailability: '',
    facilities: '',
    carModel: '',
    carType: '',
    seatingCapacity: '',
    fuelDriverIncluded: '',
    additionalCarServices: [],
    additionalCarServicesOther: '',
    pickupDropoff: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]); // For 'images' previews
  const [portfolioPreviews, setPortfolioPreviews] = useState([]); // Separate previews for 'portfolio'
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e, field) => {
    const files = Array.from(e.target.files); // Convert FileList to array
    if (files.length > 0) {
      if (field === 'images') {
        setServiceForm((prev) => ({ ...prev, images: files }));
        const previews = files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });
        Promise.all(previews).then((results) => setImagePreviews(results));
      } else if (field === 'portfolio') {
        setServiceForm((prev) => ({ ...prev, portfolio: files })); // Store multiple portfolio files
        const previews = files.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        });
        Promise.all(previews).then((results) => setPortfolioPreviews(results)); // Set portfolio previews
      }
    }
  };

  const handleCheckboxChange = (field, value) => {
    setServiceForm((prev) => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

 // Update the handleAddService function
const handleAddService = async (serviceData) => {
  try {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/vendor-login');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const formData = new FormData();

    // 1. Handle Files First
    // ['images', 'portfolio'].forEach((field) => {
    //   serviceData[field].forEach(file => {
    //     formData.append(field, file);
    //   });
    // });
    
// To this:
serviceData.images.forEach(file => formData.append('images', file)); 
serviceData.portfolio.forEach(file => formData.append('portfolio', file)); 

    // 2. Fix Checkbox Arrays with "Other" Values
    const checkboxFields = [
      'additionalServices',
      'additionalPhotographyServices',
      'hallTypes',
      'additionalCarServices'
    ];

    checkboxFields.forEach((field) => {
      let values = [...serviceData[field]];
      const otherField = `${field}Other`;
      
      if (values.includes('Other') && serviceData[otherField]) {
        // Replace 'Other' with the custom value
        values = values.filter(item => item !== 'Other');
        values.push(serviceData[otherField]);
      }
      
      if (values.length > 0) {
        formData.append(field, values.join(', '));
      }
    });

    // 3. Handle Other Fields
    Object.keys(serviceData).forEach((key) => {
      if (
        !['images', 'portfolio'].includes(key) &&
        !checkboxFields.includes(key) &&
        !key.endsWith('Other')
      ) {
        const value = serviceData[key];
        if (value !== '' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    // 4. Add Error Handling for Non-2xx Responses
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/services`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 10000 // 10-second timeout
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Request failed');
    }

    setSuccessMessage('Service added successfully!');
    setTimeout(() => navigate('/vendor-dashboard'), 2000);

  } catch (err) {
    // 5. Improved Error Handling
    const errorMessage = err.response 
      ? err.response.data.message 
      : err.message.includes('timeout') 
        ? 'Request timed out' 
        : 'Network error';
    
    setError(errorMessage || 'Failed to add service');
  } finally {
    setLoading(false);
  }
};

  const renderCategoryFields = () => {
    switch (serviceForm.category) {
      case 'catering':
        return (
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Cuisine Type</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Pakistani', 'Continental', 'Chinese', 'BBQ', 'Mix'].map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="cuisineType"
                    label={type}
                    value={type}
                    checked={serviceForm.cuisineType === type}
                    onChange={(e) => setServiceForm({ ...serviceForm, cuisineType: e.target.value })}
                    className="custom-radio"
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Menu Items</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={serviceForm.menuItems}
                onChange={(e) => setServiceForm({ ...serviceForm, menuItems: e.target.value })}
                placeholder="List menu items with optional prices"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Type</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Buffet', 'Plated', 'Self-Service'].map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="serviceType"
                    label={type}
                    value={type}
                    checked={serviceForm.serviceType === type}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                    className="custom-radio"
                  />
                ))}
              </div>
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Minimum Guests</Form.Label>
                  <Form.Control
                    type="number"
                    value={serviceForm.minGuests}
                    onChange={(e) => setServiceForm({ ...serviceForm, minGuests: e.target.value })}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Maximum Guests</Form.Label>
                  <Form.Control
                    type="number"
                    value={serviceForm.maxGuests}
                    onChange={(e) => setServiceForm({ ...serviceForm, maxGuests: e.target.value })}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Availability Dates</Form.Label>
              <Form.Control
                type="text"
                value={serviceForm.availabilityDates}
                onChange={(e) => setServiceForm({ ...serviceForm, availabilityDates: e.target.value })}
                placeholder="e.g., MM/DD/YYYY - MM/DD/YYYY"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Services</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Waiters', 'Table Setup', 'Cutlery', 'Other'].map((service) => (
                  <div key={service}>
                    <Form.Check
                      type="checkbox"
                      label={service}
                      checked={serviceForm.additionalServices.includes(service)}
                      onChange={() => handleCheckboxChange('additionalServices', service)}
                      className="custom-checkbox"
                    />
                    {service === 'Other' && serviceForm.additionalServices.includes('Other') && (
                      <Form.Control
                        type="text"
                        value={serviceForm.additionalServicesOther}
                        onChange={(e) => setServiceForm({ ...serviceForm, additionalServicesOther: e.target.value })}
                        placeholder="Specify other services"
                        className="mt-2 custom-input"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Customization Options</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.customizationOptions}
                onChange={(e) => setServiceForm({ ...serviceForm, customizationOptions: e.target.value })}
                placeholder="e.g., Custom menu, special requests"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={serviceForm.termsConditions}
                onChange={(e) => setServiceForm({ ...serviceForm, termsConditions: e.target.value })}
                className="custom-input"
              />
            </Form.Group>
          </div>
        );
      case 'photography':
        return (
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Photography Type</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Wedding', 'Engagement', 'Pre-wedding'].map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="photographyType"
                    label={type}
                    value={type}
                    checked={serviceForm.photographyType === type}
                    onChange={(e) => setServiceForm({ ...serviceForm, photographyType: e.target.value })}
                    className="custom-radio"
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Package Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={serviceForm.packageDetails}
                onChange={(e) => setServiceForm({ ...serviceForm, packageDetails: e.target.value })}
                placeholder="e.g., Basic, Standard, Premium packages"
                className="custom-input"
              />
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Number of Photographers</Form.Label>
                  <Form.Control
                    type="number"
                    value={serviceForm.numPhotographers}
                    onChange={(e) => setServiceForm({ ...serviceForm, numPhotographers: e.target.value })}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Coverage Duration (hours)</Form.Label>
                  <Form.Control
                    type="number"
                    value={serviceForm.coverageDuration}
                    onChange={(e) => setServiceForm({ ...serviceForm, coverageDuration: e.target.value })}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Album & Editing Services</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.albumEditing}
                onChange={(e) => setServiceForm({ ...serviceForm, albumEditing: e.target.value })}
                placeholder="e.g., Type of edits, album details"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Delivery Time</Form.Label>
              <Form.Control
                type="text"
                value={serviceForm.deliveryTime}
                onChange={(e) => setServiceForm({ ...serviceForm, deliveryTime: e.target.value })}
                placeholder="e.g., 2 weeks after event"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sample Portfolio (Multiple Images)</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/gif"
                multiple // Allow multiple files
                onChange={(e) => handleImageChange(e, 'portfolio')}
                className="custom-input"
              />
              {portfolioPreviews.length > 0 && (
                <div className="mt-3 d-flex flex-wrap gap-2">
                  {portfolioPreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Portfolio Preview ${index + 1}`}
                      className="img-fluid rounded custom-image-preview"
                      style={{ maxWidth: '150px' }}
                    />
                  ))}
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Services</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Drone', 'Videography', 'Other'].map((service) => (
                  <div key={service}>
                    <Form.Check
                      type="checkbox"
                      label={service}
                      checked={serviceForm.additionalPhotographyServices.includes(service)}
                      onChange={() => handleCheckboxChange('additionalPhotographyServices', service)}
                      className="custom-checkbox"
                    />
                    {service === 'Other' && serviceForm.additionalPhotographyServices.includes('Other') && (
                      <Form.Control
                        type="text"
                        value={serviceForm.additionalPhotographyServicesOther}
                        onChange={(e) => setServiceForm({ ...serviceForm, additionalPhotographyServicesOther: e.target.value })}
                        placeholder="Specify other services"
                        className="mt-2 custom-input"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>
          </div>
        );
      case 'venue':
        return (
          <div className="mb-4">
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Capacity (Min Guests)</Form.Label>
                  <Form.Control
                    type="number"
                    value={serviceForm.capacityMin}
                    onChange={(e) => setServiceForm({ ...serviceForm, capacityMin: e.target.value })}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Capacity (Max Guests)</Form.Label>
                  <Form.Control
                    type="number"
                    value={serviceForm.capacityMax}
                    onChange={(e) => setServiceForm({ ...serviceForm, capacityMax: e.target.value })}
                    className="custom-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Hall Types</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Indoor', 'Outdoor', 'AC', 'Non-AC'].map((type) => (
                  <Form.Check
                    key={type}
                    type="checkbox"
                    label={type}
                    checked={serviceForm.hallTypes.includes(type)}
                    onChange={() => handleCheckboxChange('hallTypes', type)}
                    className="custom-checkbox"
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pricing Structure</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.pricingStructure}
                onChange={(e) => setServiceForm({ ...serviceForm, pricingStructure: e.target.value })}
                placeholder="e.g., Per event, per guest, hourly"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Available Packages</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.availablePackages}
                onChange={(e) => setServiceForm({ ...serviceForm, availablePackages: e.target.value })}
                placeholder="e.g., Standard, VIP, Custom"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Decor Services</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.decorServices}
                onChange={(e) => setServiceForm({ ...serviceForm, decorServices: e.target.value })}
                placeholder="e.g., Basic, Themed, Customizable"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Catering Included?</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Yes', 'No', 'Optional'].map((option) => (
                  <Form.Check
                    key={option}
                    type="radio"
                    name="cateringIncluded"
                    label={option}
                    value={option}
                    checked={serviceForm.cateringIncluded === option}
                    onChange={(e) => setServiceForm({ ...serviceForm, cateringIncluded: e.target.value })}
                    className="custom-radio"
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Parking Availability</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.parkingAvailability}
                onChange={(e) => setServiceForm({ ...serviceForm, parkingAvailability: e.target.value })}
                placeholder="e.g., Yes, 100 cars"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Facilities Provided</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.facilities}
                onChange={(e) => setServiceForm({ ...serviceForm, facilities: e.target.value })}
                placeholder="e.g., Stage, Sound System, Lighting"
                className="custom-input"
              />
            </Form.Group>
          </div>
        );
      case 'car':
        return (
          <div className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Car Model & Make</Form.Label>
              <Form.Control
                type="text"
                value={serviceForm.carModel}
                onChange={(e) => setServiceForm({ ...serviceForm, carModel: e.target.value })}
                placeholder="e.g., Toyota Corolla"
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Car Type</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Luxury', 'Standard', 'SUV', 'Limousine'].map((type) => (
                  <Form.Check
                    key={type}
                    type="radio"
                    name="carType"
                    label={type}
                    value={type}
                    checked={serviceForm.carType === type}
                    onChange={(e) => setServiceForm({ ...serviceForm, carType: e.target.value })}
                    className="custom-radio"
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Seating Capacity</Form.Label>
              <Form.Control
                type="number"
                value={serviceForm.seatingCapacity}
                onChange={(e) => setServiceForm({ ...serviceForm, seatingCapacity: e.target.value })}
                className="custom-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fuel & Driver Included?</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Yes', 'No'].map((option) => (
                  <Form.Check
                    key={option}
                    type="radio"
                    name="fuelDriverIncluded"
                    label={option}
                    value={option}
                    checked={serviceForm.fuelDriverIncluded === option}
                    onChange={(e) => setServiceForm({ ...serviceForm, fuelDriverIncluded: e.target.value })}
                    className="custom-radio"
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Services</Form.Label>
              <div className="d-flex flex-wrap gap-3">
                {['Decoration', 'Other'].map((service) => (
                  <div key={service}>
                    <Form.Check
                      type="checkbox"
                      label={service}
                      checked={serviceForm.additionalCarServices.includes(service)}
                      onChange={() => handleCheckboxChange('additionalCarServices', service)}
                      className="custom-checkbox"
                    />
                    {service === 'Other' && serviceForm.additionalCarServices.includes('Other') && (
                      <Form.Control
                        type="text"
                        value={serviceForm.additionalCarServicesOther}
                        onChange={(e) => setServiceForm({ ...serviceForm, additionalCarServicesOther: e.target.value })}
                        placeholder="Specify other services"
                        className="mt-2 custom-input"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pickup & Drop-off Locations</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={serviceForm.pickupDropoff}
                onChange={(e) => setServiceForm({ ...serviceForm, pickupDropoff: e.target.value })}
                className="custom-input"
              />
            </Form.Group>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>
        {`
          .custom-input {
            border-radius: 0.375rem;
            border: 1px solid #ced4da;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .custom-input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }
          .custom-button {
            padding: 0.5rem 1.5rem;
            font-weight: 500;
            transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
          }
          .custom-button:hover {
            opacity: 0.9;
          }
          .custom-radio, .custom-checkbox {
            margin-right: 1rem;
          }
          .custom-radio input, .custom-checkbox input {
            cursor: pointer;
          }
          .custom-image-preview {
            max-height: 150px;
            object-fit: cover;
            border: 1px solid #dee2e6;
          }
          .input-group-text {
            background-color: #f8f9fa;
            border-color: #ced4da;
          }
          .card {
            border: none;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          h1.text-primary {
            font-size: 1.75rem;
            font-weight: 600;
          }
        `}
      </style>
      <Container fluid className="min-vh-100 bg-light py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm p-4">
              <Card.Body>
                <h1 className="mb-4 text-center text-primary">Add New Service</h1>
                {!showForm ? (
                  <div className="text-center">
                    <Button
                      variant="primary"
                      onClick={() => setShowForm(true)}
                      className="custom-button"
                    >
                      Start Adding Service
                    </Button>
                  </div>
                ) : (
                  <>
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form  onSubmit={(e) => {
    e.preventDefault();
    handleAddService(serviceForm);
  }}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={serviceForm.category}
                          onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                          required
                          className="custom-input"
                        >
                          <option value="">Select a category</option>
                          <option value="catering">Catering</option>
                          <option value="photography">Photography</option>
                          <option value="venue">Venue Booking</option>
                          <option value="car">Car Rental</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                      {serviceForm.category && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Service Name</Form.Label>
                            <Form.Control
                              type="text"
                              value={serviceForm.name}
                              onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                              required
                              className="custom-input"
                            />
                          </Form.Group>
                          <Row className="mb-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Price</Form.Label>
                                <div className="input-group">
                                  <span className="input-group-text">
                                    <i className="bi bi-currency-dollar"></i>
                                  </span>
                                  <Form.Control
                                    type="number"
                                    value={serviceForm.price}
                                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                                    required
                                    className="custom-input"
                                  />
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Location</Form.Label>
                                <div className="input-group">
                                  <span className="input-group-text">
                                    <i className="bi bi-geo-alt"></i>
                                  </span>
                                  <Form.Control
                                    type="text"
                                    value={serviceForm.location}
                                    onChange={(e) => setServiceForm({ ...serviceForm, location: e.target.value })}
                                    required
                                    className="custom-input"
                                  />
                                </div>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                              type="text"
                              value={serviceForm.address}
                              onChange={(e) => setServiceForm({ ...serviceForm, address: e.target.value })}
                              required
                              className="custom-input"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={serviceForm.description}
                              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                              required
                              className="custom-input"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Service Images (Multiple)</Form.Label>
                            <Form.Control
                              type="file"
                              accept="image/jpeg,image/png,image/gif"
                              multiple
                              onChange={(e) => handleImageChange(e, 'images')}
                              className="custom-input"
                            />
                            {imagePreviews.length > 0 && (
                              <div className="mt-3 d-flex flex-wrap gap-2">
                                {imagePreviews.map((preview, index) => (
                                  <img
                                    key={index}
                                    src={preview}
                                    alt={`Image Preview ${index + 1}`}
                                    className="img-fluid rounded custom-image-preview"
                                    style={{ maxWidth: '150px' }}
                                  />
                                ))}
                              </div>
                            )}
                          </Form.Group>
                          {renderCategoryFields()}
                          <div className="d-flex justify-content-end gap-3 mt-4">
                            <Button
                              variant="outline-secondary"
                              onClick={() => navigate('/vendor-dashboard')}
                              className="custom-button"
                            >
                              Cancel
                            </Button>
                            <Button
                               type="submit"                              
                              onClick={() => handleAddService(serviceForm)}
                              disabled={
                                !serviceForm.name ||
                                !serviceForm.price ||
                                !serviceForm.description ||
                                !serviceForm.category ||
                                !serviceForm.location ||
                                !serviceForm.address ||
                                loading
                              }
                              className="custom-button" style={{ backgroundColor: 'purple', color: '#fff' }}
                            >
                              {loading ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                  <span className="ms-2">Saving...</span>
                                </>
                              ) : (
                                'Save Service'
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </Form>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AddService;