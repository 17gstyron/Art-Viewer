import Unsplash, { toJson } from "unsplash-js";
import { useState, useEffect } from "react";
import config from "../config";

const unsplash = new Unsplash({
  accessKey: config.unsplashAPI,
});

export default function Home(props) {
  const [images, setImages] = useState(props.data || {});
  const [image, setImage] = useState(
    "https://wallpaperaccess.com/full/173801.png"
  );
  const [imageIndex, setImageIndex] = useState(0);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  const [searchBarValue, setSearchBarValue] = useState("");

  useEffect(() => {
    if (images[0]) {
      setImage(images[imageIndex].urls.raw);
    }
    if (typeof window !== "undefined") {
      // Handler to call on window resize
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      window.addEventListener("resize", handleResize);

      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      search();
    }
  }

  function search() {
    unsplash.search
      .photos(searchBarValue, 1, 100, {})
      .then(toJson)
      .then((res) => {
        setImages(res.results);
        setImageIndex(0);
        setImage(res.results[0].urls.raw);
      });
  }

  function traverseImageArray(direction) {
    if (
      (imageIndex === 0 && direction === -1) ||
      (imageIndex === images.length - 1 && direction === 1)
    ) {
      alert("No more that way");
    } else {
      setImageIndex(imageIndex + direction);
      setImage(images[imageIndex + direction].urls.raw);
    }
  }

  // Renders the next and previous images of the current image being viewed
  function loadNextImages(currentIndex) {
    if (typeof window !== "undefined") {
      const indexOfElementsToRender = [currentIndex - 1, currentIndex + 1];
      const renderedImages = indexOfElementsToRender.forEach((index) => {
        if (index < 0 || index > images.length - 1) {
        } else {
          const img = new Image();
          img.src = images[index].urls.raw; // by setting an src, you trigger browser download

          img.onload = () => {
            // when it finishes loading, update the component state
          };
        }
      });
    }
  }

  loadNextImages(imageIndex);
  return (
    <div
      style={{
        height: windowSize.height,
        width: windowSize.width,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "absolute", top: "10%" }}>
        <div className="form__group field">
          <input
            type="input"
            className="form__field"
            placeholder="Name"
            name="name"
            id="name"
            value={searchBarValue}
            onChange={(e) => setSearchBarValue(e.target.value)}
            style={{ width: 500 }}
            autoComplete="off"
            onKeyDown={handleKeyDown}
          />
          <label className="form__label">Search</label>
        </div>
      </div>
      <a
        href="#"
        className="previous round"
        style={{
          position: "absolute",
          top: "50%",
          left: 75,
          width: 75,
          height: 75,
          textAlign: "center",
          lineHeight: 1.1,
          fontSize: 50,
        }}
        onClick={() => {
          traverseImageArray(-1);
        }}
      >
        &#8249;
      </a>
      <a
        href="#"
        className="next round"
        style={{
          position: "absolute",
          top: "50%",
          right: 75,
          width: 75,
          height: 75,
          textAlign: "center",
          lineHeight: 1.1,
          fontSize: 50,
        }}
        onClick={() => {
          traverseImageArray(1);
        }}
      >
        &#8250;
      </a>
      <img
        src={image}
        style={{ height: windowSize.height, width: windowSize.width }}
      />
    </div>
  );
}

export async function getServerSideProps() {
  let data = [];
  await unsplash.search
    .photos("hello", 1, 100, { order_by: "latest" })
    .then(toJson)
    .then((res) => {
      data = res.results;
    });
  return { props: { data } };
}
