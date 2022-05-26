//import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import fetchImg from 'services/api';
import s from './ImageGallery.module.css';
import ImageGalleryItem from '../ImageGalleryItem/ImageGalleryItem';
import Button from '../Button/Button';
import Modal from '../Modal';
import Loader from '../Loader/Loader';

export default function ImageGallery({ imgName }) {
  const [gallery, setGallery] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [showBtn, setShowBtn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (imgName.length > 0) {
      setGallery([]);
      setShowBtn(false);
      setStatus('pending');
      fetchImg(imgName, 1)
        .then(data => {
          setGallery(prevState => [...prevState, ...data.hits]);
          setStatus('resolved');
          if (data.hits.length > 0) {
            setShowBtn(true);
            setPageNumber(state => state + 1);
          }
        })
        .catch(error => {
          setStatus('rejected');
          setError(error);
        });
    }
  }, [imgName]);

  const fetchRequest = () => {
    fetchImg(imgName, pageNumber)
      .then(data => {
        setGallery(state => [...state, ...data.hits]);
        setStatus('resolved');
        if (data.hits.length > 0) {
          setShowBtn(true);
          setPageNumber(state => state + 1);
        }
      })
      .catch(error => {
        setStatus('rejected');
        setError(error);
      });
  };

  const onLoadMore = () => {
    fetchRequest();
  };

  const setActiveIdx = index => {
    setActiveImgIdx(index);
    setShowModal(true);
  };

  const toggleModal = () => {
    setShowModal(state => !state);
  };

  if (status === 'rejected') {
    return <h1>{error.message}</h1>;
  }

  return (
    <div>
      {status === 'resolved' && (
        <ul className={s.gallery}>
          {gallery.map((hit, index) => (
            <ImageGalleryItem
              key={hit.id}
              webformatURL={hit.webformatURL}
              largeImageURL={hit.largeImageURL}
              setActiveIdx={() => setActiveIdx(index)}
            />
          ))}
        </ul>
      )}
      {status === 'pending' && <Loader />}
      {showModal && (
        <Modal onClose={toggleModal}>
          <img src={gallery[activeImgIdx].largeImageURL} alt="" width="700px" />
        </Modal>
      )}
      {showBtn && <Button onLoadMore={onLoadMore} />}
    </div>
  );
}

ImageGallery.propTypes = {
  state: PropTypes.shape({
    gallery: PropTypes.array,
    number: PropTypes.number,
    error: PropTypes.string,
    status: PropTypes.string,
    showBtn: PropTypes.bool,
    showModal: PropTypes.bool,
    activeImgIdx: PropTypes.number,
    pageNumber: PropTypes.number,
  }),
};
