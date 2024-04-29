# OlympicGames

## Présentation
Le TéléSport Olympic Dashboard est une application web interactive développée pour TéléSport à l'occasion des Jeux Olympiques. Cette application permet aux utilisateurs de visualiser des données historiques sur les Jeux Olympiques, telles que le nombre de médailles par pays.

## Fonctionnalités
- **Dashboard Principal :** Affiche un graphique des médailles par pays. L'utilisateur peut cliquer sur un pays pour accéder à des détails spécifiques.
- **Page Country-details :** Présente des informations détaillées sur le pays sélectionné, y compris le nombre total de médailles obtenues et le nombre d'athlètes présentés aux Jeux Olympiques, accompagnés d'un graphique représentant les performances par édition.

## Technologie
Cette application utilise Angular pour le front-end. Les principales pratiques techniques incluent :
- Utilisation de services Angular pour les appels HTTP.
- Gestion des données asynchrones avec RxJS et les observables.
- Bonnes pratiques de souscription et désinscription aux observables.
- Typage fort pour éviter l'utilisation du type `any` dans le code.

## Installation
Pour installer et lancer l'application sur votre machine locale, suivez ces étapes :

1. Clonez le dépôt GitHub :
    ```
    git clone https://github.com/tibrook/Openclassroom-P2
    ```
2. Installez les dépendances :
    ```
    cd Developpez-le-front-end-en-utilisant-Angular
    npm install
    ```
3. Lancez le serveur de développement :
    ```
    ng serve
    ```
4. Ouvrez votre navigateur à l'adresse `http://localhost:4200/`.

## Prérequis
Vous devez avoir Node.js et Angular CLI v17 installés sur votre machine. Pour vérifier si vous avez Angular CLI installé, exécutez cette commande :
    ```
ng version
    ```
Si Angular CLI n'est pas installé, vous pouvez l'installer globalement en utilisant npm :
    ```
npm install -g @angular/cli
    ```

## Contribuer
Pour contribuer au projet, veuillez suivre les pratiques standard de développement Angular et soumettre vos pull requests pour révision.

## Contact
Pour plus d'informations ou pour tout problème, veuillez contacter Guillouet Alexandre ou envoyer un email à alexandre.guillouet@gmail.com
