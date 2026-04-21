import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from './theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
  },

  text: {
    fontSize: SIZES.text,
    color: COLORS.text,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  buttonPrimary: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    fontWeight: 'bold',
    color: COLORS.black,
  },
});