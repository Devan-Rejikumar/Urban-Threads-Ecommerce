
import Image from "react-bootstrap/Image";
import Footer from "../../components/user/Footer";
import Header from "../../components/user/Header";
import './About.css'

const productImages = [
    '/assets/BlackPanther.jpg',
    '/assets/Deadpool.jpg',
    '/assets/itachi.jpg',
    '/assets/venome.jpg',
    '/assets/kakashi.jpg'
]

export default function AboutPage() {
    return (
        <>
        <Header />
      <div className="about-page">
        <header className="text-center py-5">
          <h1 className="display-4">About Us</h1>
        </header>
        <div className="banner-image-container">
        <Image
          src="/assets/AboutUs.jpg"
          alt="Banner Image"
     
          className="banner-image"
         
        />
      </div>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <p className="about-text">
                Urban Threads is your go-to clothing brand for fans of superheroes and cartoons. We blend bold designs
                with high-quality fabrics to bring your favorite characters to life. Celebrate your fandom with stylish
                apparel that lets you stand out while staying true to your unique personality. Be heroic, be you! Whether
                you're into classic cartoons or the latest superhero adventures, we've got something for everyone. Each
                piece is crafted with passion and a love for pop culture, ensuring you wear more than just clothes — you
                wear a story. Perfect for every fan and every occasion, Urban Threads turns imagination into fashion. Join
                us and unleash your inner hero!
              </p>
            </div>
          </div>
        </div>
  
        {/* Product Gallery */}
        <div className="container pb-5">
          <div className="row g-4">
            {productImages.map((image, index) => (
              <div key={index} className="col-6 col-md-4 col-lg">
                <div className="product-image-wrapper">
                  <Image src={image} alt={`Product ${index + 1}`} width={300} height={400} className="product-image" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
      </>
    )
  }
  
  