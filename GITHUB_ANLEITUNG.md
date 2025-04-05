Um dieses Projekt zu GitHub zu pushen, folgen Sie diesen Schritten:

1. Erstellen Sie ein neues Repository auf GitHub
2. Verbinden Sie Ihr lokales Repository mit dem GitHub-Repository:
   git remote add origin https://github.com/DEIN_USERNAME/DEIN_REPO.git

3. Pushen Sie den Code zu GitHub:
   git push -u origin master

Oder alternativ mit GitHub CLI:
gh repo create DEIN_REPO --private --source=. --push
