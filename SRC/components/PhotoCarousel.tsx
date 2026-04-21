import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  image: string;
}

const PhotoCarousel = () => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselData: CarouselItem[] = [
    { id: '1', image: 'https://picsum.photos/400/300?random=1' },
    { id: '2', image: 'https://picsum.photos/400/300?random=2' },
    { id: '3', image: 'https://picsum.photos/400/300?random=3' },
    { id: '4', image: 'https://picsum.photos/400/300?random=4' },
    { id: '5', image: 'https://picsum.photos/400/300?random=5' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0.5,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }: { item: CarouselItem }) => (
    <View style={styles.carouselItem}>
      <Image source={{ uri: item.image }} style={styles.carouselImage} />
      <View style={styles.imageOverlay} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      />
      {/* <View style={styles.gradientOverlay} /> */}
      <View style={styles.dotsContainer}>
        {carouselData.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
  carouselItem: {
    width: width,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
    height: '100%',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  activeDot: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    width: 32,
  },
});

export default PhotoCarousel;
