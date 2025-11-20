---
description: How to push the project to GitHub
---

1.  **Initialize Git**:
    ```bash
    git init
    ```

2.  **Add Files**:
    ```bash
    git add .
    ```

3.  **Commit Changes**:
    ```bash
    git commit -m "Initial commit: 9jaDirectory setup with Next.js and Supabase"
    ```

4.  **Create Repository on GitHub**:
    - Go to [GitHub.com/new](https://github.com/new).
    - Name it `9ja-directory`.
    - **Important**: Do NOT initialize with README, .gitignore, or License (we already have them).
    - Click "Create repository".

5.  **Link and Push**:
    - Copy the commands under "…or push an existing repository from the command line".
    - They will look like this (replace `YOUR_USERNAME`):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/9ja-directory.git
    git branch -M main
    git push -u origin main
    ```

## Troubleshooting

### "Author identity unknown"
If you see this error, run these commands:
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

### "fatal: adding files failed" (nul file)
If you have a file named `nul` that is blocking git, run this in Command Prompt (cmd):
```cmd
del \\?\c:\Users\USER\9ja-directory\nul
```
