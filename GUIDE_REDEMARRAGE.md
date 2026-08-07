# 🔄 GUIDE DE REDÉMARRAGE COMPLET

## ✅ **ÉTAPE 1 : Arrêter tous les serveurs**

### Dans Visual Studio Code ou votre éditeur :
1. Cherchez les onglets "Terminal" en bas de l'écran
2. Vous devriez voir 3 terminaux qui exécutent `npm run dev` ou `npm run preview`
3. Pour CHAQUE terminal :
   - Cliquez dans le terminal
   - Appuyez sur **Ctrl+C**
   - Attendez que le processus s'arrête (vous verrez un message comme "Terminated" ou le prompt reviendra)

### OU dans des fenêtres PowerShell séparées :
1. Trouvez toutes les fenêtres PowerShell/CMD ouvertes
2. Dans chacune, appuyez sur **Ctrl+C**
3. Fermez les fenêtres

---

## ✅ **ÉTAPE 2 : Vérifier que tout est arrêté**

Ouvrez un nouveau terminal et tapez :
```powershell
netstat -ano | findstr :5173
```

**Si rien ne s'affiche** : ✅ Tout est arrêté, passez à l'étape 3

**Si quelque chose s'affiche** : Un processus utilise encore le port 5173
- Notez le numéro PID (dernière colonne)
- Tapez : `taskkill /PID [numéro] /F`
- Exemple : `taskkill /PID 12345 /F`

---

## ✅ **ÉTAPE 3 : Ouvrir UN SEUL nouveau terminal**

Dans Visual Studio Code :
1. Menu **Terminal** > **New Terminal**
2. OU appuyez sur **Ctrl+`** (backtick)

Vous devriez voir un terminal vide avec le prompt :
```
PS C:\Users\grego\Documents\minisite-douai>
```

---

## ✅ **ÉTAPE 4 : Lancer le serveur**

Dans le terminal, tapez EXACTEMENT :
```bash
npm run dev
```

Appuyez sur **Entrée**.

---

## ✅ **ÉTAPE 5 : Attendre le démarrage**

Vous devriez voir des messages comme :
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Attendez ce message avant de continuer !**

---

## ✅ **ÉTAPE 6 : Ouvrir l'application**

Dans votre navigateur, ouvrez :
```
http://localhost:5173/observations/liste-stations
```

---

## ✅ **ÉTAPE 7 : Attendre les données**

Sur la page, vous verrez :
1. D'abord : "Chargement des données..."
2. Après 10-15 secondes : Le tableau avec les 2000+ stations !

---

## 🔍 **SI ÇA NE FONCTIONNE TOUJOURS PAS**

### Vérifiez la console du navigateur :
1. Appuyez sur **F12**
2. Allez dans l'onglet **Console**
3. Cherchez des messages d'erreur en rouge
4. Envoyez-moi une capture d'écran

### OU utilisez la page de test qui fonctionne déjà :
```
http://localhost:5173/test-stations.html
```

Cette page affiche déjà les 100 premières stations et fonctionne sans problème.

---

## 📝 **RÉSUMÉ DES COMMANDES**

```powershell
# 1. Vérifier si le port est libre
netstat -ano | findstr :5173

# 2. Si besoin, tuer le processus (remplacez 12345 par le PID)
taskkill /PID 12345 /F

# 3. Aller dans le dossier
cd C:\Users\grego\Documents\minisite-douai

# 4. Lancer le serveur
npm run dev
```

---

## ✅ **APRÈS LE REDÉMARRAGE**

Vous aurez accès à :
- 📍 **Carte Interactive** : http://localhost:5173/observations/carte
- 📋 **Liste des Stations** : http://localhost:5173/observations/liste-stations
- 📊 **Réseau National** : http://localhost:5173/observations/national

Toutes les pages afficheront les 2000+ stations en temps réel ! 🎉

---

**Suivez ces étapes une par une et dites-moi où vous bloquez si vous avez un problème !**
