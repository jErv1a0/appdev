import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';

export default function FeedbackScreen() {
    const navigation = useNavigation<any>();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = () => {
        if (!fullName.trim() || !email.trim() || !message.trim() || rating === 0) {
            Alert.alert('Incomplete feedback', 'Please complete full name, email, feedback, and star rating.');
            return;
        }

        Alert.alert('Feedback received', 'Thank you for helping improve StayGrid.');
        setFullName('');
        setEmail('');
        setMessage('');
        setRating(0);
    };

    return (
        <View style={[styles.container, localStyles.mainContainer]}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={localStyles.gridLineVertical} />

            <ScrollView contentContainerStyle={localStyles.content} showsVerticalScrollIndicator={false}>

                {/* Minimalist Top Header */}
                <View style={localStyles.headerSection}>
                    <Text style={localStyles.protocolLabel}>Feedback Active</Text>
                    <Text style={localStyles.title}>Feedback</Text>
                    <Text style={localStyles.subtitle}>
                        Operational analysis and optimization parameters for the grid.
                    </Text>
                </View>

                {/* Form Elements Container */}
                <View style={localStyles.formContainer}>
                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>Full Name</Text>
                        <TextInput
                            style={localStyles.input}
                            placeholder="Your full name"
                            placeholderTextColor="#9A9A9A"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>Email Address</Text>
                        <TextInput
                            style={localStyles.input}
                            placeholder="email@host.com"
                            placeholderTextColor="#9A9A9A"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>Message</Text>
                        <TextInput
                            style={localStyles.messageInput}
                            placeholder="How can we build a better experience for you?"
                            placeholderTextColor="#9A9A9A"
                            multiline
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>

                    {/* Interactive Rating Component */}
                    <View style={localStyles.ratingContainer}>
                        <Text style={localStyles.label}>Star Rating</Text>
                        <View style={localStyles.ratingRow}>
                            {[1, 2, 3, 4, 5].map(starValue => (
                                <TouchableOpacity
                                    key={starValue}
                                    style={localStyles.starButton}
                                    onPress={() => setRating(starValue)}
                                    accessibilityLabel={`Rate ${starValue} stars`}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            localStyles.star,
                                            rating >= starValue ? localStyles.starActive : localStyles.starInactive,
                                        ]}
                                    >
                                        ★
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Main Action Block */}
                <View style={localStyles.actionSection}>
                    <TouchableOpacity
                        style={localStyles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.9}
                    >
                        <Text style={localStyles.submitButtonText}>Submit Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={localStyles.backLink}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.6}
                    >
                        <Text style={localStyles.backLinkText}>Back</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const localStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#FFFFFF',
    },
    gridLineVertical: {
        position: 'absolute',
        left: '10%',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 48,
        gap: 24,
    },
    headerSection: {
        alignItems: 'flex-start',
    },
    protocolLabel: {
        color: '#4A5568',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    kicker: {
        color: '#111111',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        opacity: 0.4,
        marginBottom: 6,
    },
    title: {
        color: '#111111',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.8,
    },
    subtitle: {
        color: '#666666',
        fontSize: 15,
        marginTop: 8,
        lineHeight: 22,
        fontWeight: '400',
    },
    formContainer: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#111111',
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: -0.1,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#111111',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#111111',
        backgroundColor: '#FFFFFF',
        fontWeight: '500',
    },
    messageInput: {
        borderWidth: 1.5,
        borderColor: '#111111',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#111111',
        backgroundColor: '#FFFFFF',
        minHeight: 140,
        textAlignVertical: 'top',
        lineHeight: 20,
        fontWeight: '500',
    },
    ratingContainer: {
        gap: 10,
        marginTop: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 12,
    },
    starButton: {
        paddingRight: 4,
    },
    star: {
        fontSize: 36,
        fontWeight: '400',
    },
    starActive: {
        color: '#FFD700',
    },
    starInactive: {
        color: '#111111',
        opacity: 0.15,
    },
    actionSection: {
        gap: 16,
        marginTop: 12,
    },
    submitButton: {
        backgroundColor: '#FFD700',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#111111',
        shadowColor: '#111111',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
        elevation: 2, // Minimalist crisp pop depth
    },
    submitButtonText: {
        color: '#111111',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: -0.2,
    },
    backLink: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    backLinkText: {
        color: '#111111',
        fontWeight: '700',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
