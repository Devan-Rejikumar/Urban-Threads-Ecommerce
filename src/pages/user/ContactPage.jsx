import React from "react";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";

const ContactPage = () => {
  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold text-dark">Contact Us</h1>
              <p className="text-muted">
                We're here to help with any questions or concerns you may have.
              </p>
            </div>

            <div className="bg-dark text-white rounded shadow p-5">
              <div className="text-center">
                <h2 className="h4 mb-4">Get in Touch</h2>
                
                <div className="mb-4">
                  <h3 className="h5">Customer Care</h3>
                  <p className="fs-5 fw-bold">+91 9562209682</p>
                  <p className="mb-0">For any assistance, please contact our customer care</p>
                </div>

                <div className="mb-4">
                  <h3 className="h5">Email</h3>
                  <p className="fs-5">
                    <a href="mailto:UrbanThreads@gmail.com" className="text-info text-decoration-none">
                      UrbanThreads@gmail.com
                    </a>
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h5">Visit Us</h3>
                  <p className="mb-0">Urban Threads Fashion House</p>
                  <p className="mb-0">42 Fashion Avenue, Style District</p>
                  <p className="mb-0">Mumbai, Maharashtra 400001</p>
                  <p>India</p>
                </div>

                <div className="mt-4">
                  <p className="small">
                    Our customer service team is available Monday through Saturday,
                    <br />9:00 AM to 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;