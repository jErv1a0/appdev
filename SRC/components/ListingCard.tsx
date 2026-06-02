import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { COLORS } from '../theme';

interface SpecItem {
  label: string;
  value: string;
}

interface ListingCardProps {
  place: string;
  location: string;
  price: string | number;
  // `image` may be a local require or an object; `imageUrl` is accepted when callers provide a string URL.
  image?: ImageSourcePropType | { uri: string } | string | null;
  imageUrl?: string | null;
  availability: string;
  bookingDays: number;
  onBook: () => void;
  tag?: string;
  typeCode?: string;
  specs?: SpecItem[];
}

export default function ListingCard({
  place,
  location,
  price,
  image,
  imageUrl,
  availability,
  onBook,
  tag = 'PREMIUM',
  typeCode = 'TYPE_01',
  specs = [
    { label: 'SPEC', value: '1-2 GUESTS' },
    { label: 'SPEC', value: '25 SQM' },
    { label: 'SPEC', value: 'QUEEN BED' },
  ],
}: ListingCardProps) {
  // Resolve image source to avoid passing `null`/`undefined` to <Image /> which causes warnings
  let resolvedImage: ImageSourcePropType | { uri: string };
  if (image) {
    if (typeof image === 'string') {
      resolvedImage = { uri: image } as { uri: string };
    } else {
      resolvedImage = image as ImageSourcePropType;
    }
  } else if (imageUrl) {
    resolvedImage = { uri: imageUrl };
  } else {
    resolvedImage = { uri: 'https://via.placeholder.com/400x300.png?text=No+Image' };
  }
  return (
    <View style={styles.shadowPlateContainer}>
      <View style={styles.yellowOffsetPlate} />

      {/* Main Structural Card Body */}
      <View style={styles.cardContainer}>

        {/* Visual Media Wrapper */}
        <View style={styles.imageContainer}>
          <Image
            source={resolvedImage}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {/* Top-Left Category Ribbon Tag */}
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
          </View>
          {/* Type Code Badge Top Right */}
          <View style={styles.typeCodeBadge}>
             <Text style={styles.typeCodeText}>{typeCode}</Text>
          </View>
        </View>

        {/* Meta Content Section */}
        <View style={styles.contentSection}>

          {/* Header Row Block */}
          <View style={styles.headerRow}>
            <Text style={styles.placeTitle} numberOfLines={1}>{place.toUpperCase()}_</Text>
          </View>

          {/* Location Description Paragraph */}
          <Text style={styles.locationDescription}>
            Perfect luxury stay located in {location}. {availability}. Structured room configuration for the high-performance traveler.
          </Text>

          {/* Clean Numerical Price Display - Clean Text Only */}
          <Text style={styles.inlinePriceText}>₱{price} <Text style={styles.perNightLabel}>/ CYCLE</Text></Text>

          <View style={styles.dividerLine} />

          {/* Three-Column Spec Grid from blueprint mock definitions */}
          <View style={styles.specGridRow}>
            {specs.map((spec: SpecItem, idx: number) => (
              <View key={idx} style={styles.specColumn}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button Block */}
        <TouchableOpacity style={styles.actionButton} onPress={onBook} activeOpacity={0.9}>
          <Text style={styles.actionButtonText}>View Listing →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowPlateContainer: {
    position: 'relative',
    marginBottom: 24,
    width: '100%',
  },
  yellowOffsetPlate: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    top: 4,
    left: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    overflow: 'hidden',
    zIndex: 2,
  },
  imageContainer: {
    width: '100%',
    height: 210,
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1.5,
    borderColor: COLORS.black,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomRightRadius: 4,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  typeCodeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  placeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
    letterSpacing: -0.5,
    flex: 1,
    paddingRight: 8,
  },
  typeCodeText: {
    fontSize: 10,
    color: '#A0A0A0',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  locationDescription: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 19,
    marginBottom: 10,
  },
  inlinePriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 12,
  },
  perNightLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#EAEAEA',
    width: '100%',
    marginBottom: 14,
  },
  specGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  specColumn: {
    alignItems: 'center',
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A0A0A0',
    letterSpacing: 1,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderColor: COLORS.black,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
