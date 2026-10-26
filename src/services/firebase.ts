import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, RoomData, GameState, PlayerColor } from '../types/game';
import { generateRoomCode, createInitialGameState } from '../game/ludoEngine';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by skill guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Expected if collection does not exist or client is starting up
  }
}
testConnection();

// Persistent Guest ID (Zero external auth dependency, completely reliable)
export function getOrCreateGuestId(): string {
  const key = 'ludo_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(key, id);
  }
  return id;
}

export function getCurrentPlayerId(): string {
  return auth.currentUser ? auth.currentUser.uid : getOrCreateGuestId();
}

// Sign in with Google Popup (Configured by ProvisionFirebase)
export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  try {
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (err) {
    console.error('Google sign in error:', err);
    throw err;
  }
}

// Sign Out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Get or create player profile in Firestore for Google-authenticated users
export async function syncUserProfile(user: User, fallbackName?: string, avatar?: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const newProfile: UserProfile = {
      id: user.uid,
      displayName: user.displayName || fallbackName || `Player_${user.uid.slice(0, 4)}`,
      avatar: avatar || 'crown-gold',
      isGuest: false,
      totalMatches: 0,
      wins: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// Update profile stats (wins, matches)
export async function recordGameStats(userId: string, isWinner: boolean): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }
  const userRef = doc(db, 'users', userId);
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      await updateDoc(userRef, {
        totalMatches: (data.totalMatches || 0) + 1,
        wins: (data.wins || 0) + (isWinner ? 1 : 0),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ----------------- ONLINE MULTIPLAYER ROOMS -----------------

// Create a multiplayer room
export async function createOnlineRoom(
  hostUserId: string,
  hostName: string,
  hostAvatar: string,
  maxPlayers: number = 4
): Promise<{ roomId: string; code: string; room: RoomData }> {
  const code = generateRoomCode();
  const roomId = `room_${code}`;
  const roomRef = doc(db, 'rooms', roomId);
  const path = `rooms/${roomId}`;

  const hostPlayer = {
    id: hostUserId,
    name: hostName,
    avatar: hostAvatar,
    color: 'red' as PlayerColor,
    isHost: true,
    isReady: true,
    isOnline: true,
    joinedAt: Date.now(),
  };

  const roomData: RoomData = {
    id: roomId,
    code,
    hostId: hostUserId,
    status: 'waiting',
    maxPlayers,
    playerCount: 1,
    players: {
      [hostUserId]: hostPlayer,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(roomRef, roomData);
    return { roomId, code, room: roomData };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Join an online room by code
export async function joinOnlineRoom(
  code: string,
  userId: string,
  userName: string,
  userAvatar: string
): Promise<{ roomId: string; room: RoomData }> {
  const cleanCode = code.trim().toUpperCase();
  const roomsColl = collection(db, 'rooms');
  const path = 'rooms';

  try {
    const q = query(roomsColl, where('code', '==', cleanCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`Room with code "${cleanCode}" not found.`);
    }

    const roomDoc = snapshot.docs[0];
    const room = roomDoc.data() as RoomData;
    const roomId = roomDoc.id;

    if (room.status !== 'waiting' && !room.players[userId]) {
      throw new Error('This match has already started.');
    }

    // Already in room?
    if (room.players[userId]) {
      return { roomId, room };
    }

    // Check capacity
    const currentKeys = Object.keys(room.players);
    if (currentKeys.length >= room.maxPlayers) {
      throw new Error('Room is already full.');
    }

    // Assign next available color
    const usedColors = currentKeys.map(k => room.players[k].color);
    const colorCandidates: PlayerColor[] =
      room.maxPlayers === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
    const availableColor = colorCandidates.find(c => !usedColors.includes(c)) || 'blue';

    const newPlayer = {
      id: userId,
      name: userName,
      avatar: userAvatar,
      color: availableColor,
      isHost: false,
      isReady: true,
      isOnline: true,
      joinedAt: Date.now(),
    };

    const updatedPlayers = {
      ...room.players,
      [userId]: newPlayer,
    };

    const updatePath = `rooms/${roomId}`;
    await updateDoc(doc(db, 'rooms', roomId), {
      players: updatedPlayers,
      playerCount: Object.keys(updatedPlayers).length,
      updatedAt: new Date().toISOString(),
    });

    return {
      roomId,
      room: {
        ...room,
        players: updatedPlayers,
        playerCount: Object.keys(updatedPlayers).length,
      },
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    throw err;
  }
}

// Start match from waiting lobby (Host only)
export async function startOnlineGame(roomId: string, room: RoomData): Promise<void> {
  const path = `rooms/${roomId}`;
  const playerList = Object.values(room.players).map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
    type: 'remote' as const,
    tokensHome: 0,
    isHost: p.isHost,
    isOnline: p.isOnline,
  }));

  const initialGameState = createInitialGameState(playerList, true);
  initialGameState.roomId = roomId;
  initialGameState.roomCode = room.code;

  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      status: 'in_progress',
      gameState: initialGameState,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Synchronize updated game state (after roll, move, turn switch)
export async function syncOnlineGameState(roomId: string, gameState: GameState): Promise<void> {
  const path = `rooms/${roomId}`;
  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      gameState,
      status: gameState.winners.length > 0 ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Send an in-game reaction emoji (e.g. 🎉, 🎲, 🔥, 👑, 😱)
export async function sendRoomReaction(roomId: string, userId: string, emoji: string): Promise<void> {
  const path = `rooms/${roomId}`;
  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      reaction: {
        userId,
        emoji,
        timestamp: Date.now(),
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Subscribe to real-time updates for a room
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: RoomData) => void,
  onError: (err: unknown) => void
) {
  const path = `rooms/${roomId}`;
  const roomRef = doc(db, 'rooms', roomId);

  return onSnapshot(
    roomRef,
    snapshot => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as RoomData);
      }
    },
    error => {
      handleFirestoreError(error, OperationType.GET, path);
      onError(error);
    }
  );
}
