import os
import pandas as pd
import json

PARQUET_FILE = 'train-main.parquet'
OUTPUT_FILE = 'dataset-llama2-13b-300.jsonl'
DATASET_SIZE = 300
MIN_CHARS = 500
MAX_CHARS = 5000

INSTRUCTIONS = """[INST]\nGiven the transcript of a youtube video, generate a high quality summary of the relevant content. Organize the information in a clear and easy-to-read format.\n[\INST]\n\n"""
SAMPLE_TRANSCRIPT = """in today's video we're going to look at electromagnetism which is the phenomenon whereby electric currents produce their own magnetic fields and we'll see how this works in ordinary wires coils solenoids and electromagnets let's start by imagining that we had a wire and that we let current flow through it from bottom to top this electric current would produce its own magnetic field all around the wire which we can represent with field lines in this case the field lines would be concentric circles around the wire and they'd be closest together near to the wire as that's where the magnetic field is strongest the direction of the magnetic field though is going to depend on the direction of the current so to help us remember which way it goes we can use something called the right hand rule if you take your right hand curl it into a fist and point your thumb in the direction that the current is flowing then the direction that your fingers are curling in tells you the direction of the magnetic field so for our wire in which the current is going upwards the magnetic field would be going anti-clockwise and so we would mark each of our concentric circles with little arrows in that direction however if we had another wire with the current going in the opposite direction then by using the right hand rule again with our hand upside down this time we see that the magnetic field is now traveling in the opposite direction to make things a bit trickier let's now imagine that instead of two separate straight wires we instead joined them together so that we had a single flat circular coil with the current flowing in through the bottom left and out through the right as the magnetic fields of the two sides of our coil interact the magnetic fields which were concentric circles will now get stretched out and form ellipses and as the magnetic fields combine they'll form a single magnetic field which runs straight through the center of the coil which if we were to look at it from above would look like this if we now add a lot more turns to our coil all next to each other in one long piece of wire we make something called a solenoid and importantly the magnetic field within a solenoid is strong and uniform outside the coil the field is just like the one we'd find around a bar magnet and just like a bar magnet where the field lines come out is the north pole and where they point in is the south pole so we've effectively used electricity to create a magnet and so we call it an electromagnet one of the useful things about electromagnets is that they're only magnetic for as long as we keep the current flowing through the wire as soon as we turn off the power source the magnetic field disappears and when we turn it back on it comes back as well as being able to turn it on and off we can also reverse the direction of the magnetic field by reversing the direction in which our current is flowing we can show this by reversing the direction of our little current arrows and each time we flip them the direction of our field lines and the sides of the poles will also flip around indicating that our magnetic field has flipped directions now the problem with our electromagnets here is that a small electromagnet like this one would only produce a very weak magnetic field so you need to know the four ways that we can increase an electromagnet strength the most obvious way is just to increase the current that flows through the solenoid second we can increase the number of turns in our coil while keeping the length of the solenoid the same and similarly we could decrease the length of the coil while keeping the number of turns the same basically solenoids that have very densely packed coils will be the strongest the last thing we can do is add an iron core to the inside of our solenoid as iron is a soft magnetic material it will become an induced magnet when the solenoid is switched on which will massively increase the strength of the electromagnet's magnetic field but importantly it will also lose its magnetic field as soon as the current is turned off anyway that's all for today so hope you enjoyed it and we'll see you next time"""
SAMPLE_SUMMARY = """The video is an educational piece on electromagnetism, specifically focusing on how electric currents produce their own magnetic fields. It starts by explaining the concept using a wire with current flowing from bottom to top, which creates a magnetic field around the wire. The presenter uses the right-hand rule to explain the direction of the magnetic field, which is represented by concentric circles around the wire.

The video then introduces a second wire with current flowing in the opposite direction, demonstrating that the magnetic field also travels in the opposite direction. The presenter then combines the two wires into a single flat circular coil, explaining how the magnetic fields interact and form a single magnetic field running through the center of the coil.

The video progresses to discuss solenoids, which are created by adding more turns to the coil. The presenter explains that the magnetic field within a solenoid is strong and uniform, and outside the coil, the field is similar to that of a bar magnet. The video then introduces the concept of electromagnets, which are essentially solenoids that can be turned on and off by controlling the current flow.

The presenter concludes by discussing ways to increase the strength of an electromagnet. These include increasing the current flowing through the solenoid, increasing the number of turns in the coil, decreasing the length of the coil, and adding an iron core to the solenoid."""

SAMPLE_TRANSCRIPT_2 = """Tails OS a free based AF operating system designed to protect you against malware censorship and surveillance it was first released in 2009 and became famous when Edward Snowden used it to communicate with reporters exposing the government's Mass surveillance programs most personal computers are just cool prisons that track your every movement and harvest your biometric data so advertisers can eventually unburden you from your money Tails OS is a Debian based Linux distro that boots from a USB stick to turn any computer into a temporarily secure machine when you finally discover the true shape of the earth you might think you're clever because you used a private browser and deleted all the files from your computer but traces were left behind on disk that could be recovered via forensic analysis and now they're going to try to unalive you Tails helps you avoid this fate thanks to Amnesia everything you do disappears automatically when the OS shuts down because Tails never writes anything to the hard disk and only runs from the memory on your computer when you get a knock at the door there's no need to rip out your hard drive and flush it down the toilet instead just turn the computer off and all the totally legit it and mundane things you just did will be lost forever however it is possible to store some information on the USB like browser bookmarks or documents that you want to persist between sessions and of course they're encrypted automatically when you boot it up you'll find your favorite canoe utilities but also privacy focused software like the tour browser which routes internet traffic through the Tor Network consisting of multiple layers of encrypted relays where no individual relay knows both where you're coming from and where you're going to conceal your location IP address and usage in fact any application that tries to access the internet without the tour network is automatically blocked on Tails this makes it a great option for journalists working on sensitive topics victims of domestic abuse or anyone who enjoys truly free software where free means freedom what will you do without freedom to get started grab a USB stick with at least eight gigabytes of memory then download the version that matches your current OS now verify the file to ensure that it wasn't corrupted during download then use a tool like etcher to safely flash it on the USB stick next make sure you have the official startup instructions on a separate device then on Windows hold down the the shift key while clicking on the restart button from the start menu then use the option to reboot from a device this will bring up a boot menu where you can select the USB stick at which point you can select Tails from the bootloader and now we're officially running Tails go through the initial setup and most importantly make sure you have a good connection to the tour Network congratulations you now have a private and Anonymous computer everything you do now is stored in random access memory and not on disk in addition when tail shuts down it will overwrite most of the ram to prevent a cold boot attack where someone extracts a memory dump from the ram which is often done in digital forensics to catch the bad guys this has been Tails OS in 100 seconds but don't tell anybody I told you about it thanks for watching and I will see you in the next one [Music]"""
SAMPLE_SUMMARY_2 = """The video is about Tails OS, a free operating system designed to protect users against malware, censorship, and surveillance. It was first released in 2009 and gained popularity when Edward Snowden used it to expose the government's mass surveillance programs.

The speaker explains that most personal computers track users' movements and collect biometric data for advertising purposes. Tails OS, however, is a Debian-based Linux distro that boots from a USB stick, turning any computer into a temporarily secure machine. 

The speaker emphasizes the feature of "Amnesia" in Tails OS, which ensures that everything done on the operating system disappears automatically when it shuts down. This is because Tails never writes anything to the hard disk and only runs from the computer's memory. 

The speaker also mentions that Tails OS includes privacy-focused software like the Tor browser, which conceals the user's location, IP address, and usage. Any application that tries to access the internet without the Tor network is automatically blocked on Tails.

The video then provides a step-by-step guide on how to install and run Tails OS from a USB stick. The speaker stresses the importance of having a good connection to the Tor network for the best privacy and security.

Key takeaways from the video include the importance of privacy and security in today's digital age, the benefits of using Tails OS, and how to install and use it. The speaker also emphasizes that everything done on Tails OS is stored in random access memory and not on disk, adding an extra layer of security."""
# FEW_SHOT_TEXT = f"""{INSTRUCTIONS}Transcript:\n{SAMPLE_TRANSCRIPT}\n#END TRANSCRIPT\nSummary:\n{SAMPLE_SUMMARY}\n#END SUMMARY\n{SAMPLE_TRANSCRIPT_2}\n#END TRANSCRIPT\nSummary:\n{SAMPLE_SUMMARY_2}\n#END SUMMARY"""

def get_df_from_parquet(parquet_file):
    assert(os.path.exists(parquet_file))
    """Read a parquet file into a pandas DataFrame"""
    return pd.read_parquet(parquet_file)

def get_texts_and_summaries(df):
    """Get the texts and summaries from the DataFrame"""
    assert(df is not None)
    texts = df['text'].tolist()
    summaries = df['summary'].tolist()
    return texts, summaries

def is_valid_entry(text, summary):
    if not text or not summary:
        return None
    if len(text) < MIN_CHARS or len(text) > MAX_CHARS:
        return None
    if len(summary) < MIN_CHARS or len(summary) > MAX_CHARS:
        return None
    # clean summaries
    if summary.startswith('\u2013'):
        summary = summary[1:]
    # remove leading and trailing whitespace
    text = text.strip()
    summary = summary.strip()
    if summary[0].islower():
        # Make the first letter of the summary uppercase
        summary = summary[0].upper() + summary[1:]
    # Replace instances of " ," with ","
    text = text.replace(" ,", ",")
    summary = summary.replace(" ,", ",")
    return text, summary

def write_to_file(texts: list[str], summaries: list[str], output_file):
    """Write the texts and summaries to a file"""
    assert(len(texts) >= DATASET_SIZE)
    with open(output_file, 'w', encoding='utf-8') as f:
        count = 0
        alternate_sample = True
        for text, summary in zip(texts, summaries):
            result = is_valid_entry(text, summary)
            if result is None:
                continue
            text, summary = result
            if alternate_sample:
                few_shot = INSTRUCTIONS + "Sample Transcript:\n" + SAMPLE_TRANSCRIPT + "\n#END TRANSCRIPT\nSample Summary:\n" + SAMPLE_SUMMARY + "\n#END SUMMARY"
            else:
                few_shot = INSTRUCTIONS + "Sample Transcript:\n" + SAMPLE_TRANSCRIPT_2 + "\n#END TRANSCRIPT\nSample Summary:\n" + SAMPLE_SUMMARY_2 + "\n#END SUMMARY"
            
            entry = f"{few_shot}\nRelevant Transcript:\n{text}\n#END TRANSCRIPT\nRelevant Summary:\n{summary}\n#END SUMMARY"
            data = {"text" : entry}
            json.dump(data, f, ensure_ascii=False)
            f.write('\n')

            alternate_sample = not alternate_sample
            count += 1
            if count >= DATASET_SIZE:
                break

def main():
    parquet_file = PARQUET_FILE
    df = get_df_from_parquet(parquet_file)
    texts, summaries = get_texts_and_summaries(df)
    output_file = OUTPUT_FILE
    write_to_file(texts, summaries, output_file)

if __name__ == '__main__':
    main()