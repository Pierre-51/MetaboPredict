# MetaboPredict

## Prérequis

- [Neo4j Desktop](https://neo4j.com/download/) installé
- Python 3 installé

pip3 install -r requirements.txt 

---

## Installation

### 1. Configurer Neo4j

1. Installer [Neo4j Desktop](https://neo4j.com/download/)
2. Créer une nouvelle instance de base de données
3. Définir un mot de passe — **il doit correspondre aux identifiants utilisés dans les fichiers du projet** (actuellement `12345678`)
4. Démarrer l'instance

### 2. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 3. Charger la base de données

Ouvrir `database_load/load_neo4j.py` et vérifier que le mot de passe Neo4j correspond bien à celui que vous venez de créer.

Ensuite, lancer le script de chargement :

```bash
python3 database_load/load_neo4j.py
```

Le dump se trouve à l'emplacement suivant :
```
database_load/projects/project-43c519f4-5a12-4ad6-9131-6159115e71e2/
```

Une fois le script terminé, la base de données est prête.

---

## Configuration

Le mot de passe Neo4j doit être identique dans **trois fichiers** :

| Fichier | Emplacement |
|---------|-------------|
| `settings.py` | Paramètres du backend Django |
| `co_culture.js` | JavaScript frontend |
| `neo4j.js` | Connecteur Neo4j JS |

Le mot de passe par défaut est `12345678`. Si vous en utilisez un autre, pensez à le mettre à jour dans les trois fichiers.

---

## Lancer l'application

```bash
python3 manage.py runserver
```

L'application sera accessible à l'adresse [http://127.0.0.1:8000](http://127.0.0.1:8000) par défaut.