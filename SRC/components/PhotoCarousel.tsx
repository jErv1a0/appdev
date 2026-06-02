import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, Image, StyleSheet, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselItem {
  id: string;
  image: string;
}

export default function PhotoCarousel() {
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const carouselData: CarouselItem[] = [
    { id: '1', image: 'https://picsum.photos/600/800?random=1' },
    { id: '2', image: 'https://picsum.photos/600/800?random=2' },
    { id: '3', image: 'https://picsum.photos/600/800?random=3' },
    { id: '4', image: 'https://picsum.photos/600/800?random=4' },
    { id: '5', image: 'https://picsum.photos/600/800?random=5' },
  ];

  // Auto-play protocol looping sequence
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      
      setCurrentIndex(nextIndex);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentIndex, carouselData.length]);

  // Sync state index on user manual gesture swipe
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const computedIndex = Math.round(contentOffsetX / width);
    if (computedIndex !== currentIndex) {
      setCurrentIndex(computedIndex);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        bounces={false}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.carouselImage} 
            />
            {/* Ambient vignette scrim to balance text separation */}
            <View style={styles.vignetteOverlay} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1214',
  },
  carouselItem: {
    width: width,
    height: '100%',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Deeper tactical backdrop ambient shade for high-contrast web app text values
    backgroundColor: 'rgba(10, 15, 24, 0.45)', 
  },
});