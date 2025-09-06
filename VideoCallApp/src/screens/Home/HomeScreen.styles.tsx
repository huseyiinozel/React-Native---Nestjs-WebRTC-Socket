import { StyleSheet,Dimensions } from "react-native";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111', padding: 16 },
    title: { color: '#fff', fontSize: 22, fontWeight: "bold", marginBottom: 16  },
    input: { width: '75%', backgroundColor: '#222', color: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 12 },
    btn: { backgroundColor: '#4a8ef7', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
    btnText: { color: '#fff', fontWeight: '700' },
    langBtn: { position: 'absolute', top: height/8, left: width/20, backgroundColor: '#4a8ef7', padding: 8, borderRadius: 6 },
    langText: { color: '#fff', fontWeight: '700' },
});

export default styles;