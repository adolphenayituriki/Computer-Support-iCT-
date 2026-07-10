import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import News from '../src/models/News.js';
import Course from '../src/models/Course.js';

const MONGO_URI = process.env.MONGO_URI_CLOUD || process.env.MONGO_URI;
const IMG = (id) => `https://picsum.photos/seed/news${id}/800/450`;
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;

const newsData = [
  {
    title: 'CS Hub Launches New Computer Repair Workshop',
    content: `We are excited to announce the launch of our new hands-on computer repair workshop series! Starting next month, students and community members can learn how to diagnose and fix common hardware issues.\n\nThe workshop covers:\n- Laptop disassembly and reassembly\n- Screen and keyboard replacement\n- Hard drive upgrades and data recovery\n- Thermal paste application and fan cleaning\n\nEach session is led by our experienced technicians and includes practical exercises. Spaces are limited to 10 participants per session to ensure personalized attention.\n\nTo register, visit the CS Hub office or send us an email. Members get priority booking!`,
    mediaType: 'image',
    mediaUrl: IMG(101),
    author: 'CS Hub Admin',
  },
  {
    title: 'Understanding Computer Viruses and How to Stay Protected',
    content: `Computer viruses remain one of the biggest threats to personal and organizational security. In this article, we break down the most common types of malware and how you can protect yourself.\n\nTypes of Malware:\n1. Ransomware – Encrypts your files and demands payment\n2. Trojans – Disguised as legitimate software\n3. Worms – Self-replicating and spread across networks\n4. Spyware – Secretly monitors your activity\n5. Adware – Displays unwanted advertisements\n\nProtection Tips:\n- Always keep your antivirus software updated\n- Avoid clicking suspicious links or email attachments\n- Use strong, unique passwords for each account\n- Enable two-factor authentication where possible\n- Regularly back up your important files\n\nStay safe online!`,
    mediaType: 'text',
    mediaUrl: '',
    author: 'Security Team',
  },
  {
    title: 'How to Build Your First PC: A Step-by-Step Guide',
    content: `Building your own PC can seem daunting, but with the right guidance, anyone can do it. Follow this step-by-step guide to assemble your first computer.\n\nStep 1: Gather Your Components\nYou'll need a CPU, motherboard, RAM, storage (SSD/HDD), power supply, GPU (if not integrated), and a case.\n\nStep 2: Prepare Your Workspace\nUse a clean, flat surface with good lighting. Keep your tools handy — a Phillips head screwdriver is essential.\n\nStep 3: Install the CPU\nOpen the CPU socket lever, align the golden triangle on the CPU with the triangle on the socket, gently place it in, and lower the lever.\n\nStep 4: Install RAM\nAlign the notch on the RAM stick with the slot and press firmly until the clips click into place.\n\nStep 5: Mount the Motherboard\nPlace the I/O shield in the case first, then screw the motherboard into the standoffs.\n\nStep 6: Install Storage\nMount your SSD or HDD in the drive bay and connect the SATA cable.\n\nStep 7: Install the Power Supply\nMount the PSU and route cables neatly. Connect the 24-pin motherboard power, CPU power, and GPU power.\n\nStep 8: Install the GPU\nInsert the graphics card into the PCIe slot and secure it with screws.\n\nStep 9: Cable Management\nRoute cables behind the motherboard tray for better airflow and aesthetics.\n\nStep 10: Power On!\nConnect your monitor, keyboard, and mouse. Press the power button and enter the BIOS to configure your boot drive.\n\nCongratulations! You've built your first PC.`,
    mediaType: 'image',
    mediaUrl: IMG(102),
    author: 'Tech Team',
  },
  {
    title: 'Windows 11 Tips and Tricks for Power Users',
    content: `Windows 11 comes packed with features that can significantly boost your productivity. Here are some power user tips you might not know about.\n\n1. Snap Layouts – Hover over the maximize button to quickly snap windows into various layouts.\n\n2. Virtual Desktops – Create separate desktops for work, gaming, and personal use. Switch between them with Ctrl + Win + Left/Right.\n\n3. Keyboard Shortcuts:\n- Win + Z: Open Snap Layouts\n- Win + V: Open clipboard history\n- Win + Shift + S: Open Snipping Tool\n- Win + . (period): Open emoji panel\n\n4. Focus Sessions – Use the Clock app's Focus Sessions feature to block distractions and stay productive.\n\n5. Widgets Board – Customize your widgets to show weather, calendar, news, and more.\n\n6. Voice Typing – Press Win + H to start voice typing anywhere.\n\n7. Storage Sense – Enable automatic cleanup of temporary files and old downloads.\n\nTry these tips and watch your productivity soar!`,
    mediaType: 'image',
    mediaUrl: IMG(103),
    author: 'Productivity Team',
  },
  {
    title: 'Network Security Basics: What Every Student Should Know',
    content: `In today's connected world, understanding network security is essential for everyone. This guide covers the fundamentals.\n\nWhat is Network Security?\nNetwork security involves protecting the integrity, confidentiality, and accessibility of computer networks and data.\n\nKey Concepts:\n- Firewalls: Act as a barrier between trusted and untrusted networks\n- Encryption: Scrambles data so only authorized parties can read it\n- VPNs: Create a secure tunnel for data transmission\n- IDS/IPS: Monitor network traffic for suspicious activity\n\nCommon Threats:\n- Man-in-the-Middle attacks\n- DDoS attacks\n- Packet sniffing\n- ARP spoofing\n\nBest Practices:\n- Use WPA3 encryption on Wi-Fi networks\n- Change default router passwords\n- Disable WPS on your router\n- Keep firmware updated\n- Use a VPN on public Wi-Fi\n\nRemember: Security is not a product, but a process.`,
    mediaType: 'text',
    mediaUrl: '',
    author: 'Network Team',
  },
  {
    title: 'CS Hub Annual Technology Fair 2026 — Save the Date!',
    content: `Mark your calendars! The CS Hub Annual Technology Fair is returning on August 15-16, 2026. This year's theme is "Empowering the Next Generation of Innovators."\n\nWhat to Expect:\n- Keynote speeches from industry leaders\n- Hands-on workshops in robotics, programming, and hardware\n- Student project exhibitions\n- Networking opportunities with tech professionals\n- Career guidance sessions\n- Competitions with exciting prizes\n\nLocation: CS Hub Main Campus, ICT Building\nTime: 9:00 AM - 5:00 PM both days\n\nAdmission is free for all registered students. External visitors can purchase tickets at the door.\n\nWe look forward to seeing you there!`,
    mediaType: 'image',
    mediaUrl: IMG(104),
    author: 'Events Committee',
  },
  {
    title: 'Introduction to Linux: Why You Should Make the Switch',
    content: `Linux is more than just an operating system — it's a powerful tool that can transform the way you work with computers. Here's why you should consider making the switch.\n\n1. It's Free and Open Source\nLinux is completely free to use, modify, and distribute. No license fees, no activation keys.\n\n2. Security\nLinux is inherently more secure than other operating systems due to its permission-based architecture and smaller target footprint.\n\n3. Performance\nLinux runs efficiently on older hardware, breathing new life into aging computers.\n\n4. Development Friendly\nMost programming tools and servers run natively on Linux. Package managers make installing software a breeze.\n\n5. Customization\nFrom desktop environments (GNOME, KDE, XFCE) to window managers (i3, bspwm), you can tailor every aspect of your experience.\n\nPopular Distributions for Beginners:\n- Ubuntu – Most beginner-friendly\n- Linux Mint – Familiar interface for Windows users\n- Pop!_OS – Great for developers\n- Zorin OS – Beautiful and intuitive\n\nReady to try Linux? Start with a live USB and see how it feels!`,
    mediaType: 'image',
    mediaUrl: IMG(105),
    author: 'Open Source Team',
  },
  {
    title: 'Troubleshooting Common Printer Issues',
    content: `Printer problems are among the most frustrating tech issues. Here's how to solve the most common ones.\n\nProblem 1: Printer Not Responding\n- Check that the printer is powered on\n- Verify the USB or network connection\n- Restart both the printer and computer\n- Set the printer as default in system settings\n\nProblem 2: Poor Print Quality\n- Run the printer's cleaning cycle\n- Check ink or toner levels\n- Align the print heads\n- Use the correct paper type setting\n\nProblem 3: Paper Jams\n- Gently remove any stuck paper\n- Check for torn pieces inside the rollers\n- Ensure paper is loaded correctly\n- Don't overfill the paper tray\n\nProblem 4: Slow Printing\n- Reduce print quality settings\n- Update printer drivers\n- Print in grayscale instead of color\n- Clear the print queue\n\nProblem 5: Wireless Connection Issues\n- Move the printer closer to the router\n- Reconnect to the Wi-Fi network\n- Update printer firmware\n- Use a static IP address\n\nWhen all else fails, consult your printer's manual or contact the manufacturer's support.`,
    mediaType: 'text',
    mediaUrl: '',
    author: 'Support Team',
  },
  {
    title: 'Video Tutorial: How to Upgrade Your Laptop RAM',
    content: `In this video tutorial, we walk you through the process of upgrading your laptop's RAM. A simple upgrade that can dramatically improve your computer's performance.\n\nTopics covered:\n- Determining compatible RAM type (DDR3, DDR4, DDR5)\n- Tools you'll need\n- Step-by-step installation\n- Verifying the upgrade in BIOS and Windows\n- Common mistakes to avoid\n\nWatch the full tutorial and let us know if you have any questions!`,
    mediaType: 'video',
    mediaUrl: YT('d_1H7P1D3W4'),
    author: 'CS Hub Media',
  },
  {
    title: 'The Future of Artificial Intelligence in Education',
    content: `Artificial Intelligence is reshaping the educational landscape. From personalized learning paths to automated grading, AI promises to transform how we teach and learn.\n\nCurrent Applications:\n- Intelligent tutoring systems that adapt to student performance\n- Automated essay scoring and feedback\n- Predictive analytics for early intervention\n- Chatbots for 24/7 student support\n- Virtual reality simulations for immersive learning\n\nChallenges to Consider:\n- Data privacy and security concerns\n- Algorithmic bias and fairness\n- The digital divide\n- Teacher training and adaptation\n- Maintaining human connection in education\n\nAt CS Hub, we believe in harnessing AI to empower educators, not replace them. Our upcoming workshop series will explore practical ways to integrate AI tools into your study routine.\n\nStay tuned for more updates!`,
    mediaType: 'image',
    mediaUrl: IMG(106),
    author: 'Research Team',
  },
];

const courseData = [
  {
    title: 'Computer Basics: Getting Started',
    description: 'A beginner-friendly introduction to computers — learn about hardware, software, and how to use a computer confidently.',
    content: `## What is a Computer?\n\nA computer is an electronic device that processes data and performs tasks according to a set of instructions.\n\n## Main Components\n\n### Hardware\n- **CPU (Central Processing Unit)**: The brain of the computer\n- **RAM (Random Access Memory)**: Temporary storage for active tasks\n- **Storage (HDD/SSD)**: Where your files are permanently stored\n- **Motherboard**: The main circuit board connecting everything\n- **Power Supply**: Provides electricity to all components\n\n### Software\n- **Operating System**: Windows, macOS, or Linux\n- **Applications**: Programs like Word, Excel, browsers\n\n## How to Turn On and Log In\n\n1. Press the power button\n2. Wait for the system to boot\n3. Enter your username and password\n4. You're now on the desktop!\n\n## Practice Exercise\nTry opening the File Explorer and navigating to your Documents folder. Create a new folder named "My Practice".`,
    category: 'general',
    difficulty: 'beginner',
    estimatedTime: '30 mins',
    tags: ['basics', 'beginner', 'introduction'],
  },
  {
    title: 'Hardware Identification and Diagnosis',
    description: 'Learn to identify computer hardware components and diagnose common hardware problems like a pro.',
    content: `## Identifying Components\n\n### Internal Components\n- **CPU**: Usually under a heatsink with a fan\n- **RAM Sticks**: Long, thin circuit boards\n- **GPU**: Often the largest component (for gaming/design)\n- **Storage Drives**: 2.5" or 3.5" drives, or M.2 SSDs\n\n### External Ports\n- **USB**: Connect peripherals (keyboard, mouse, flash drive)\n- **HDMI/DisplayPort**: Connect monitors\n- **Ethernet**: Wired internet connection\n- **Audio Jacks**: For headphones and microphones\n\n## Common Hardware Issues\n\n### Computer Won't Turn On\n1. Check power cable connection\n2. Test the power supply\n3. Check the power button connection to the motherboard\n\n### Overheating\n1. Clean dust from fans and vents\n2. Reapply thermal paste\n3. Ensure proper airflow in the case\n\n### No Display\n1. Check monitor cable\n2. Test with another monitor\n3. Reseat the GPU\n4. Check RAM seating`,
    category: 'hardware',
    difficulty: 'intermediate',
    estimatedTime: '1 hour',
    tags: ['hardware', 'diagnosis', 'repair'],
  },
  {
    title: 'Windows Operating System: Installation and Configuration',
    description: 'Step-by-step guide to installing, configuring, and troubleshooting the Windows operating system.',
    content: `## System Requirements\n\n### Windows 11 Minimum Requirements\n- 1 GHz dual-core processor\n- 4 GB RAM\n- 64 GB storage\n- TPM 2.0\n- UEFI with Secure Boot\n\n## Installation Steps\n\n1. **Create Installation Media**\n   - Download Windows Media Creation Tool\n   - Use an 8GB+ USB drive\n\n2. **Boot from USB**\n   - Enter BIOS (usually F2, F12, or Del)\n   - Set USB as first boot device\n\n3. **Install Windows**\n   - Select language and region\n   - Enter product key (or skip)\n   - Choose "Custom Install"\n   - Select the drive and install\n\n4. **Initial Setup**\n   - Create user account\n   - Set up PIN\n   - Configure privacy settings\n\n## Post-Installation\n\n1. Install drivers (GPU, chipset, network)\n2. Run Windows Update\n3. Install antivirus\n4. Install essential software`,
    category: 'software',
    difficulty: 'intermediate',
    estimatedTime: '2 hours',
    tags: ['windows', 'installation', 'configuration', 'os'],
  },
  {
    title: 'Network Fundamentals: Connecting and Configuring',
    description: 'Understand how networks work, from home Wi-Fi to enterprise configurations.',
    content: `## What is a Network?\n\nA network connects two or more computers to share resources and data.\n\n## Network Types\n\n- **LAN (Local Area Network)**: Small area (home, office)\n- **WAN (Wide Area Network)**: Large area (internet)\n- **WLAN (Wireless LAN)**: Wi-Fi networks\n\n## Key Devices\n\n- **Router**: Connects networks and routes traffic\n- **Switch**: Connects devices within a network\n- **Access Point**: Provides Wi-Fi connectivity\n- **Modem**: Connects to your ISP\n\n## IP Addressing\n\n- **IPv4**: 192.168.1.1 (32-bit)\n- **IPv6**: 2001:db8::1 (128-bit)\n- **Subnet Mask**: Defines network vs host portion\n\n## Basic Configuration\n\n### Setting Up a Router\n1. Connect modem to router's WAN port\n2. Access router admin panel (usually 192.168.1.1)\n3. Set SSID (network name) and password\n4. Choose WPA2 or WPA3 encryption\n5. Update firmware\n\n## Troubleshooting\n\n1. **No Internet**\n   - Check cables\n   - Restart modem and router\n   - Check ISP status\n\n2. **Slow Connection**\n   - Check for interference\n   - Change Wi-Fi channel\n   - Move closer to router`,
    category: 'network',
    difficulty: 'beginner',
    estimatedTime: '1 hour',
    tags: ['networking', 'wifi', 'router', 'basics'],
  },
  {
    title: 'Malware Removal and Prevention',
    description: 'Learn to identify, remove, and prevent malware infections on Windows computers.',
    content: `## Types of Malware\n\n- **Virus**: Attaches to files and spreads\n- **Trojan**: Disguised as legitimate software\n- **Ransomware**: Encrypts files and demands payment\n- **Spyware**: Steals personal information\n- **Adware**: Displays unwanted ads\n\n## Signs of Infection\n\n- Slow computer performance\n- Pop-up ads everywhere\n- Browser redirected to strange sites\n- Files encrypted with .locked extension\n- Antivirus disabled\n- Strange network activity\n\n## Removal Process\n\n1. **Disconnect from the Internet**\n2. **Boot into Safe Mode**\n   - Press F8 during startup\n   - Select "Safe Mode with Networking"\n3. **Run Malware Scanners**\n   - Malwarebytes\n   - Windows Defender Offline\n   - AdwCleaner\n4. **Remove Suspicious Programs**\n   - Check Control Panel > Programs\n   - Look for unknown software\n5. **Reset Browsers**\n   - Clear cache and extensions\n   - Reset to default settings\n\n## Prevention\n\n1. Keep software updated\n2. Use a reliable antivirus\n3. Don't click suspicious links\n4. Download from official sources only\n5. Enable UAC (User Account Control)\n6. Regular backups`,
    category: 'virus',
    difficulty: 'intermediate',
    estimatedTime: '1.5 hours',
    tags: ['malware', 'virus', 'security', 'removal'],
  },
  {
    title: 'Microsoft Office Essentials: Word, Excel, and PowerPoint',
    description: 'Master the fundamentals of Microsoft Office for school, work, and personal projects.',
    content: `## Microsoft Word\n\n### Document Creation\n- Use templates for quick starts\n- Styles for consistent formatting\n- Headers and footers for professionalism\n\n### Formatting Tips\n- Ctrl+B: Bold\n- Ctrl+I: Italic\n- Ctrl+U: Underline\n- Ctrl+E: Center align\n\n## Microsoft Excel\n\n### Basic Formulas\n- \`=SUM(A1:A10)\`: Add values\n- \`=AVERAGE(B1:B10)\`: Average values\n- \`=IF(C1>50,"Pass","Fail")\": Conditional logic\n- \`=VLOOKUP(D1,A1:B10,2,FALSE)\": Look up values\n\n### Formatting\n- Use tables for structured data\n- Conditional formatting highlights important values\n- Charts visualize your data\n\n## Microsoft PowerPoint\n\n### Creating Presentations\n- Use the Slide Master for consistent design\n- Limit text: use bullet points, not paragraphs\n- Add visuals: images, charts, videos\n- Practice speaker notes\n\n### Keyboard Shortcuts\n- F5: Start slideshow\n- Ctrl+D: Duplicate slide\n- Ctrl+G: Group objects\n\n## Practice Projects\n\n1. Create a resume in Word\n2. Build a budget tracker in Excel\n3. Design a 5-slide presentation in PowerPoint`,
    category: 'software',
    difficulty: 'beginner',
    estimatedTime: '2 hours',
    tags: ['office', 'word', 'excel', 'powerpoint', 'productivity'],
  },
  {
    title: 'Advanced PC Troubleshooting Techniques',
    description: 'Go beyond the basics with advanced diagnostic methods and repair techniques for experienced technicians.',
    content: `## Diagnostic Tools\n\n### Hardware Tools\n- **Multimeter**: Test power supply voltages\n- **POST Card**: Diagnose boot failures\n- **USB Tester**: Check port power output\n\n### Software Tools\n- **HWiNFO**: Detailed system information\n- **CrystalDiskInfo**: Check hard drive health\n- **MemTest86**: Test RAM for errors\n- **Prime95**: Stress test CPU and RAM\n\n## Advanced Troubleshooting\n\n### Blue Screen of Death (BSOD) Analysis\n1. Note the stop code (e.g., MEMORY_MANAGEMENT)\n2. Check the dump file in C:\\Windows\\Minidump\n3. Use BlueScreenView to analyze\n4. Common fixes:\n   - Update drivers\n   - Check RAM with MemTest86\n   - Run SFC /SCANNOW\n   - Check for overheating\n\n### No POST / No Boot\n1. Listen for beep codes\n2. Strip to minimum components\n3. Clear CMOS\n4. Try different RAM slots\n5. Test PSU with paperclip test\n\n### Data Recovery\n1. Stop using the drive immediately\n2. Use tools like Recuva or TestDisk\n3. For physical damage, consult professionals\n\n## Professional Best Practices\n\n1. Always wear an anti-static wrist strap\n2. Document everything\n3. Backup data before repairs\n4. Use a clean, organized workspace\n5. Keep drivers and tools updated`,
    category: 'hardware',
    difficulty: 'advanced',
    estimatedTime: '3 hours',
    tags: ['advanced', 'troubleshooting', 'diagnostics', 'repair'],
  },
  {
    title: 'Introduction to Cybersecurity',
    description: 'A comprehensive introduction to cybersecurity principles, threats, and best practices for protecting digital assets.',
    content: `## What is Cybersecurity?\n\nCybersecurity is the practice of protecting systems, networks, and programs from digital attacks.\n\n## The CIA Triad\n\n- **Confidentiality**: Only authorized users can access data\n- **Integrity**: Data is accurate and unaltered\n- **Availability**: Systems are accessible when needed\n\n## Common Threats\n\n### Phishing\nDeceptive emails or messages that trick you into revealing sensitive information.\n\n**Red Flags:**\n- Urgent or threatening language\n- Misspelled domain names\n- Requests for personal information\n- Unexpected attachments\n\n### Social Engineering\nManipulating people into giving up confidential information.\n\n**Examples:**\n- Impersonation (fake IT support calls)\n- Tailgating (following someone into a restricted area)\n- Baiting (leaving infected USB drives)\n\n## Password Security\n\n### Creating Strong Passwords\n- At least 12 characters\n- Mix of uppercase, lowercase, numbers, symbols\n- Don't use personal information\n- Use a passphrase (e.g., "Correct-Horse-Battery-Staple")\n\n### Password Managers\n- LastPass, Bitwarden, 1Password\n- Generate and store complex passwords\n- Auto-fill on websites\n\n## Safe Browsing Habits\n\n1. Check for HTTPS in the URL\n2. Don't download from untrusted sources\n3. Use browser security extensions\n4. Clear cookies and cache regularly\n5. Use private browsing for sensitive activities`,
    category: 'network',
    difficulty: 'beginner',
    estimatedTime: '1 hour',
    tags: ['security', 'cybersecurity', 'privacy', 'basics'],
  },
  {
    title: 'Printer Maintenance and Repair',
    description: 'Learn to maintain, troubleshoot, and repair common printer issues for both inkjet and laser printers.',
    content: `## Printer Types\n\n### Inkjet Printers\n- Best for photo printing\n- Liquid ink cartridges\n- Cheaper upfront, higher ink costs\n\n### Laser Printers\n- Best for text documents\n- Toner cartridge\n- Higher upfront, lower per-page cost\n\n## Routine Maintenance\n\n### Weekly\n- Print a test page\n- Check paper levels\n- Clean the exterior\n\n### Monthly\n- Run head cleaning cycle (inkjet)\n- Check toner levels (laser)\n- Inspect rollers for wear\n- Update firmware\n\n### Quarterly\n- Deep clean print heads\n- Replace maintenance kit\n- Lubricate moving parts\n- Calibrate colors\n\n## Common Repairs\n\n### Replacing Ink/Toner\n1. Open the access door\n2. Remove the old cartridge\n3. Unpack the new cartridge\n4. Remove protective tape\n5. Insert and close\n\n### Fixing Paper Feed Issues\n1. Clean the pickup roller with isopropyl alcohol\n2. Check separation pad for wear\n3. Adjust paper guides\n4. Use the correct paper weight\n\n### Network Printing Problems\n1. Check IP address configuration\n2. Ensure printer is on the same subnet\n3. Reinstall printer drivers\n4. Use the printer's web interface for diagnostics`,
    category: 'hardware',
    difficulty: 'intermediate',
    estimatedTime: '1.5 hours',
    tags: ['printer', 'maintenance', 'repair', 'hardware'],
  },
  {
    title: 'Cloud Computing: Getting Started with Google Drive and OneDrive',
    description: 'Learn to use cloud storage services effectively for backup, collaboration, and file management.',
    content: `## What is Cloud Computing?\n\nCloud computing delivers computing services over the internet, including storage, processing, and software.\n\n## Cloud Storage Benefits\n\n- Access files from anywhere\n- Automatic backup\n- Easy sharing and collaboration\n- No need for physical storage devices\n- Version history\n\n## Google Drive\n\n### Getting Started\n1. Sign in with your Google account\n2. You get 15 GB free\n3. Install Google Drive for desktop\n\n### Key Features\n- Create Docs, Sheets, Slides directly\n- Share with view/edit/comment permissions\n- Search with OCR (can search text in images)\n- Offline access\n\n## Microsoft OneDrive\n\n### Getting Started\n1. Sign in with your Microsoft account\n2. You get 5 GB free\n3. Integrated with Windows File Explorer\n\n### Key Features\n- Files on Demand: See all files without downloading\n- Version history up to 30 days\n- Personal Vault for sensitive files\n- Automatic camera backup\n\n## Best Practices\n\n1. Organize files in folders\n2. Use descriptive file names\n3. Share links instead of attachments\n4. Set expiration dates for shared links\n5. Sync only necessary folders\n6. Keep local backups of critical files`,
    category: 'software',
    difficulty: 'beginner',
    estimatedTime: '45 mins',
    tags: ['cloud', 'google drive', 'onedrive', 'storage', 'backup'],
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const newsCount = await News.countDocuments();
    if (newsCount > 0) {
      console.log(`Clearing ${newsCount} existing news items...`);
      await News.deleteMany({});
    }

    await News.insertMany(newsData);
    console.log(`Inserted ${newsData.length} news items.`);

    const courseCount = await Course.countDocuments();
    if (courseCount > 0) {
      console.log(`Clearing ${courseCount} existing courses...`);
      await Course.deleteMany({});
    }

    await Course.insertMany(courseData);
    console.log(`Inserted ${courseData.length} courses.`);

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
