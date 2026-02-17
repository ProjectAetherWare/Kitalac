import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClao-RmdZEtpmvfDk-WqtdVdCf2akNTn4",
  authDomain: "kitalac.firebaseapp.com",
  projectId: "kitalac",
  storageBucket: "kitalac.firebasestorage.app",
  messagingSenderId: "181553725699",
  appId: "1:181553725699:web:416847a280e330cc666936"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

window.MK_Firebase = {
    auth: auth,
    db: db,
    currentUser: null,
    unsubscribeChat: null,

    login: async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            window.MK_Firebase.currentUser = user;
            await window.MK_Firebase.loadUserProfile(user);
            return user;
        } catch (error) {
            console.error(error);
            alert("Login Failed: " + error.message);
        }
    },

    logout: async () => {
        await signOut(auth);
        window.MK_Firebase.currentUser = null;
        location.reload(); 
    },

    loadUserProfile: async (user) => {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            const newProfile = {
                username: user.displayName || "New User",
                bio: "Just joined Kitalac!",
                joinedAt: serverTimestamp(),
                balance: 100,
                premiumBalance: 0,
                stats: { gamesPlayed: 0, totalWon: 0 }
            };
            await setDoc(userRef, newProfile);
            return newProfile;
        }
    },

    saveState: async (stateUser) => {
        if (!auth.currentUser) return;
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                username: stateUser.username,
                bio: stateUser.bio || "",
                balance: stateUser.balance,
                premiumBalance: stateUser.premiumBalance,
                stats: stateUser.stats,
                lastSeen: serverTimestamp()
            });
        } catch (e) {
            console.error("Cloud Save Error", e);
        }
    },

    initChatListener: (callback) => {
        if (window.MK_Firebase.unsubscribeChat) window.MK_Firebase.unsubscribeChat();
        
        const q = query(collection(db, "messages"), orderBy("timestamp", "desc"), limit(50));
        window.MK_Firebase.unsubscribeChat = onSnapshot(q, (snapshot) => {
            const msgs = [];
            snapshot.forEach((doc) => {
                const d = doc.data();
                msgs.push({ id: doc.id, ...d });
            });
            callback(msgs.reverse());
        });
    },

    sendMessage: async (text) => {
        if (!auth.currentUser) return;
        await addDoc(collection(db, "messages"), {
            text: text,
            uid: auth.currentUser.uid,
            username: window.MoonKat.state.user.username || auth.currentUser.displayName,
            timestamp: serverTimestamp()
        });
    },

    fetchLeaderboard: async () => {
        const q = query(collection(db, "users"), orderBy("balance", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ uid: doc.id, ...doc.data() });
        });
        return users;
    },

    getProfile: async (uid) => {
        const d = await getDoc(doc(db, "users", uid));
        return d.exists() ? d.data() : null;
    },

    getUserByUsername: async (username) => {
        const q = query(collection(db, "users"), where("username", "==", username), limit(1));
        const snap = await getDocs(q);
        if(!snap.empty) {
            return { uid: snap.docs[0].id, ...snap.docs[0].data() };
        }
        return null;
    },

    subscribeToMarket: (callback) => {
        return onSnapshot(doc(db, "global", "market"), (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data());
            }
        });
    },

    updateMarket: async (data) => {
        if (!auth.currentUser) return;
        try {
            await setDoc(doc(db, "global", "market"), {
                ...data,
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.error("Market Update Error", e);
        }
    }
};

// Auth Listener
onAuthStateChanged(auth, (user) => {
    window.MK_Firebase.currentUser = user;
    if(user) {
        if(window.app && window.app.updateAuthUI) window.app.updateAuthUI(user);
    }
});
