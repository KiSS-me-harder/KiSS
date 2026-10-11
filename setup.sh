#! /bin/bash
ssh-keygen -t ed25519 -C "kinky-sissy-school@outlook.com" -f ./id_ed25519
read -p "Add the key to github. Press enter when you are done. "
git config user.name "Sara Sissy"
git config user.email "kinky-sissy-school@outlook.com"
git config core.sshCommand "ssh -i ./id_ed25519 -o IdentitiesOnly=yes"
