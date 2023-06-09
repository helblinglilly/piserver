# Support for exFAT
sudo apt-get install exfat-fuse exfat-utils -y

# Use sudo fdisk -l to identify HDD
sudo mount -t exfat /dev/sda2 /media/hdd


# Mount the drive whenever it gets connected
# Identify UUID
UUID=$(sudo blkid -s UUID -o value /dev/sda2)

# Write file with rule
sudo bash -c 'cat > /etc/udev/rules.d/99-automount-exfat.rules <<EOF
ENV{ID_FS_UUID}=="'"$(sudo blkid -s UUID -o value /dev/sda2)"'", ENV{UDISKS_IGNORE}="0"
EOF'

# Update rules
sudo udevadm control --reload-rules

# Add fstab entry to ensure permissions
echo "UUID=$UUID /media/hdd exfat defaults,uid=1000,gid=1000 0 0"
echo "^ into /etc/fstab" 