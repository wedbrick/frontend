import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Alert, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    weddingDate: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data.data);
        setFormData({
          fullName: res.data.data.fullName || "",
          phoneNumber: res.data.data.phoneNumber || "",
          weddingDate: res.data.data.weddingDate?.split("T")[0] || "",
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to fetch profile data. Please try again.");
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put("/api/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser((prev) => ({
        ...prev,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        weddingDate: formData.weddingDate,
      }));

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    const originalAvatar = user.avatar;
    const previewURL = URL.createObjectURL(file);

    // Show temporary preview
    setUser((prev) => ({ ...prev, avatar: previewURL }));

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.post("/api/profile/avatar", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Avatar upload response:", res.data);

      // Validate response
      const avatarPath = res.data.data?.avatar;
      if (!avatarPath) {
        throw new Error("Avatar path not returned from backend");
      }

      // Construct permanent URL with cache-busting query
      const backendUrl = `${import.meta.env.VITE_API_URL}`;
      const permanentUrl = avatarPath.startsWith("/")
        ? `${backendUrl}${avatarPath}?t=${Date.now()}`
        : `${backendUrl}/${avatarPath}?t=${Date.now()}`;
      console.log("Permanent avatar URL:", permanentUrl);

      // Test URL accessibility
      const img = new Image();
      img.src = permanentUrl;
      img.onload = () => {
        setUser((prev) => ({ ...prev, avatar: permanentUrl }));
        setAvatarFile(null);
        setSuccess("Avatar updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      };
      img.onerror = () => {
        throw new Error("Failed to load avatar image from permanent URL");
      };

      // Clean up preview URL
      URL.revokeObjectURL(previewURL);
    } catch (error) {
      console.error("Avatar upload failed:", error.response?.data || error.message);
      setUser((prev) => ({ ...prev, avatar: originalAvatar }));
      setAvatarFile(null);
      setError(`Failed to update avatar: ${error.message}`);
      URL.revokeObjectURL(previewURL);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || "",
      phoneNumber: user.phoneNumber || "",
      weddingDate: user.weddingDate?.split("T")[0] || "",
    });
    setAvatarFile(null);
    setUser((prev) => ({ ...prev, avatar: user.avatar || getDefaultAvatar() }));
    setError("");
    setSuccess("");
  };

  const getDefaultAvatar = () => {
    const initial = user.fullName?.charAt(0).toUpperCase() || "?";
    return `https://ui-avatars.com/api/?name=${initial}&background=6f42c1&color=fff&size=200`;
  };

  if (!user) return <div className="container mt-5">Loading profile...</div>;

  return (
    <Container className="my-5" style={{ maxWidth: "1200px" }}>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      <Card className="mb-4 p-4">
        <h2 className="mb-4 text-center" style={{ color: "#6f42c1", fontWeight: "bold" }}>
          User Profile
        </h2>
        <Row>
          {/* Left Side: Avatar */}
          <Col md={3} className="text-center">
            <div className="avatar-container position-relative">
              <img
                src={user.avatar || getDefaultAvatar()}
                alt="Profile"
                className="rounded-circle img-fluid"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
                onError={(e) => {
                  console.error("Avatar load failed, using default:", user.avatar);
                  e.target.src = getDefaultAvatar();
                  e.target.onerror = null;
                }}
              />
            </div>
            <Form.Group className="mt-3">
              <Form.Label>Upload New Avatar</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Form.Group>
          </Col>

          {/* Right Side: Profile Form */}
          <Col md={9}>
            <Form onSubmit={handleFormSubmit}>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={user.email}
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Wedding Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="weddingDate"
                      value={formData.weddingDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: "#6f42c1", borderColor: "#6f42c1" }}
                >
                  Save Changes
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default UserProfile;