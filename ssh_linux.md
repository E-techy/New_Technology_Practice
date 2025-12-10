Markdown

# SSH Setup & Connection Guide

This guide provides a "One-Click" setup script to configure a Linux server (like Ubuntu/Multipass) for SSH access and instructions on how to connect from a client device (Mac/Windows).

---

## Part 1: Server Setup (The Device You Want to Control)

Run the script below on your Linux machine. It handles:
1.  Checking/Installing `openssh-server`.
2.  Forcing "Password Authentication" to ON (bypassing cloud-init defaults).
3.  Restarting the SSH service.
4.  Checking if the current user has a usable password and prompting to create one if needed.

### The "Auto-Setup" Script

Save the code below as `setup_ssh.sh`, make it executable, and run it.

```bash
#!/bin/bash

# ==========================================
# SSH AUTO-SETUP SCRIPT
# ==========================================

USER_NAME=$(whoami)

echo "--- [1/4] Checking SSH Service ---"
if dpkg -l | grep -q openssh-server; then
    echo "✅ openssh-server is already installed."
else
    echo "⚠️ openssh-server not found. Installing now..."
    sudo apt update && sudo apt install -y openssh-server
    if [ $? -eq 0 ]; then
        echo "✅ Installation complete."
    else
        echo "❌ Installation failed. Please check your internet connection."
        exit 1
    fi
fi

echo ""
echo "--- [2/4] Configuring SSH Security Override ---"
# We create a high-priority config file to override any defaults (like Cloud-Init)
# that might be disabling password login.

CONFIG_FILE="/etc/ssh/sshd_config.d/99-force-password.conf"

echo "Applying configuration to $CONFIG_FILE..."

# Write the configuration
sudo bash -c "cat > $CONFIG_FILE" <<EOF
# Force Password Authentication (Created by Auto-Setup Script)
PasswordAuthentication yes
KbdInteractiveAuthentication yes
EOF

if [ -f "$CONFIG_FILE" ]; then
    echo "✅ Configuration override created successfully."
else
    echo "❌ Failed to create configuration file."
    exit 1
fi

echo ""
echo "--- [3/4] Restarting SSH Service ---"
sudo systemctl enable ssh
sudo systemctl restart ssh

if systemctl is-active --quiet ssh; then
    echo "✅ SSH Service is RUNNING."
else
    echo "❌ SSH Service failed to start. Check 'sudo systemctl status ssh'."
    exit 1
fi

echo ""
echo "--- [4/4] User Password Check ---"
# Note: Linux security prevents us from reading/printing an existing password.
# We can only check if the account is 'Locked' (L), has 'No Password' (NP), or has a 'Password Set' (P).

PASSWORD_STATUS=$(sudo passwd -S "$USER_NAME" | awk '{print $2}')

if [ "$PASSWORD_STATUS" = "NP" ] || [ "$PASSWORD_STATUS" = "L" ]; then
    echo "⚠️  User '$USER_NAME' has NO PASSWORD or is LOCKED."
    echo "You MUST set a password to log in via SSH."
    echo "Please enter a new password now:"
    sudo passwd "$USER_NAME"
elif [ "$PASSWORD_STATUS" = "P" ]; then
    echo "✅ User '$USER_NAME' already has a password set."
    read -p "Do you want to change/reset it anyway? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo passwd "$USER_NAME"
    else
        echo "Keeping existing password."
    fi
else
    # Fallback for systems where passwd -S output format differs
    echo "ℹ️  Unable to detect exact password status."
    echo "If you don't remember your password, you should reset it now."
    read -p "Set a new password? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo passwd "$USER_NAME"
    fi
fi

echo ""
echo "=========================================="
echo "🎉 SETUP COMPLETE!"
echo "You can now connect to this machine."
echo "Your IP Address is:" 
ip a | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1
echo "=========================================="

```

How to Run This Script
Create the file: nano setup_ssh.sh

Paste the code above.

Save and exit (Ctrl+O, Enter, Ctrl+X).

Make it executable: chmod +x setup_ssh.sh

Run it: ./setup_ssh.sh

Part 2: Client Connection (Mac / Windows / Linux)
Once the script above finishes, go to your other device.

1. The Connection Command
Open your terminal (Mac) or PowerShell (Windows) and run:

Bash
```bash
ssh <username>@<server-ip-address>
```
Example: ssh ubuntu@100.77.153.106

Username: The user you ran the script on (usually ubuntu).

IP Address: The IP shown at the end of the script output.

2. Troubleshooting "Permission Denied"
If you still get "Permission Denied" after running the script:

Ensure you are typing the password you set in Step 4 of the script.

Ensure you are using the correct username.

3. Troubleshooting "Host Verification Failed"
If you re-installed your server or changed IPs, your Mac might think it's a security threat. Run this command on your Mac to clear the old record:

Bash
```bash
ssh-keygen -R <server-ip-address>
```
Example: ssh-keygen -R 100.77.153.106
