import html2text
import js2py
import json
import logging
import math
import os
import phonenumbers
import random
import re
import traceback
import usaddress
from datetime import datetime, timedelta

import coloredlogs
import numpy as np
import tempfile
import webbrowser
from PIL import Image
from django.conf import settings
from nameparser import HumanName
from pytesseract import pytesseract
from scrapy.selector import Selector
from termcolor import colored
from urlextract import URLExtract


def init_log():
    coloredlogs.install()

    # file_name = 'debug.log'
    # with open(file_name, 'w'): pass
    #
    # logging.basicConfig(
    #     level=logging.INFO, format="%(asctime)s | [%(levelname)s] | [%(name)s] | %(funcName)s %(lineno)d | (%(threadName)-9s) | %(message)s",
    #     handlers=[
    #         logging.FileHandler(file_name),
    #         logging.StreamHandler(sys.stdout)
    #     ]
    # )

try:
    import probablepeople as pp
except:
    ""

try:
    import pyttsx3
except:
    ""

def chunker(max_workers, seq):
    return (list(x) for x in np.array_split(seq, max_workers))

def exit():
    play_sound('script terminated')
    os._exit(1)


def open_in_browser(str1):
    fd, fname = tempfile.mkstemp('.html')
    with open(fname, 'w', encoding="utf-8") as f:
        f.write(str(str1))
    os.close(fd)
    return webbrowser.open(f"file://{fname}")


def play_sound(text):
    try:
        engine = pyttsx3.init()
        engine.setProperty("rate", 130)
        voices = engine.getProperty("voices")
        engine.setProperty("voice", voices[1].id)
        engine.say(text)
        engine.runAndWait()
    except:
        ''

def get_headers():
    user_agent_list = settings.USER_AGENT_LIST
    user_agent = user_agent_list[random.randint(0, len(user_agent_list) - 1)]
    headers = {
        'user-agent': user_agent
    }
    return headers

def html2plain(html):
    md = ''
    try:
        parser = html2text.HTML2Text()
        parser.ignore_links = True
        parser.ignore_images = True
        parser.ignore_anchors = True
        parser.body_width = 0
        md = parser.handle(str(html))
        md = preg_repace(patt='^\n+|\n+$', repl=' ', subj=md).strip()
    except:
        print(colored(traceback.format_exc(), 'red'))
    return md

def preg_repace(**kwargs):
    pattern = kwargs.get('patt')
    replacement = kwargs.get('repl')
    subject = kwargs.get('subj')
    output = ''
    try:
        output = re.compile(pattern, re.IGNORECASE)
        output = output.sub(replacement, str(subject)).strip()
    except:
        logging.error(traceback.format_exc())
    return output

def preg_match(**kwargs):
    pattern = kwargs.get('patt')
    subject = kwargs.get('subj')
    match_exist = False
    try:
        output = re.search(pattern, str(subject), re.IGNORECASE)
        if output:
            if output.group(0):
                match_exist = True
    except:
        logging.error(traceback.format_exc())
    return match_exist

def preg_split(**kwargs):
    pattern = kwargs.get('patt')
    subject = kwargs.get('subj')
    output = []
    try:
        output = re.compile(pattern, re.IGNORECASE).split(str(subject))
    except:
        logging.error(traceback.format_exc())
    return output

def verify_is_person(name_str):
    ptag = ''
    try:
        ptag = pp.tag(name_str)[1]
    except:
        ""
    Person = False
    if 'Person' in ptag:
        Person = True
    return Person

# input_date = fctcore.split_date_range_by_number_of_days(start='09/11/2019', end='06/12/2022', format='%m/%d/%Y', numberOfDays=30)
def split_date_range_by_number_of_days(**kwargs):

    start = kwargs.get('start')
    end = kwargs.get('end')
    format = kwargs.get('format')
    numberOfDays = kwargs.get('numberOfDays')

    date_list = []
    try:
        firstDate = datetime.strptime(start, format)
        lastDate = datetime.strptime(end, format)
        startdate = firstDate
        startdatelist = []
        enddatelist = []

        while startdate <= lastDate:
            enddate = startdate + timedelta(days=numberOfDays - 1)
            startdatelist.append(startdate.strftime(format))
            if enddate > lastDate: enddatelist.append(lastDate.strftime(format))
            enddatelist.append(enddate.strftime(format))
            startdate = enddate + timedelta(days=1)

        for a, b in zip(startdatelist, enddatelist):
            date_list.append([a, b])

    except:
        logging.error(traceback.format_exc())

    return date_list

def parse_address(address_input):
    usAddress = []
    try:
        usaddress.parse(address_input)
        usAddress = json.loads(json.dumps(usaddress.tag(address_input)))
    except:
        logging.error(traceback.format_exc())
    return usAddress

def get_col_name_from_xlsx(ws):
    field_info = []
    try:
        headers = [cell.value for cell in ws[1]]
        for col_name in headers:
            col_name = preg_repace(patt='\s+', repl='_', subj=col_name).strip()
            col_name = preg_repace(patt='[^\w]+', repl='_', subj=col_name).strip()
            col_name = preg_repace(patt='_+', repl='_', subj=col_name).strip()
            col_name = preg_repace(patt='^_|_$', repl='', subj=col_name).strip()
            field_info.append(col_name)
    except:
        logging.error(traceback.format_exc())

    print('field_info:', field_info)
    return field_info

def execute_js(script):

    result = ''
    try:
        js = """
        function escramble_758(){""" + script + """}
        escramble_758()
        """.replace("document.write", "return ")

        result = js2py.eval_js(js)  #
    except:
        ""
    return result

def perify_field(field):
    try:
        tab = ['—', 'None', 'Null']
        if field == '' or field in tab:
            field = None
    except:
        print(traceback.format_exc())
    return field

def conv_to_float(field):
    try:
        if (field == '' or field is None):
            field = None
        else:
            field = float(field)
    except:
        print(traceback.format_exc())
    return field

def conv_to_int(field):
    try:
        if (field == '' or field is None):
            field = None
        else:
            field = int(float(field))
    except:
        print(traceback.format_exc())
    return field

def letters_to_numbers(text):
    return ''.join([(str(ord(x) - 96) if x.isalpha() else x) for x in list(text)])

def get_field_input(id, i, df):
    field = ''
    try:
        field = str(df.iloc[i][id]).strip()
        if (field == 'nan'):
            field = ''
    except:
        ""
    return field

def convert_size(size_bytes):
    if size_bytes == 0:
        return "0B"
    size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return "%s %s" % (s, size_name[i])


from concurrent.futures import ThreadPoolExecutor

def extract_emails_from_chunk(chunk):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    return re.findall(email_pattern, chunk)

def get_emails(text):
    emails = []
    try:
        if text:
            # logging.info(f'get_emails')
            # logging.info(f'text: {len(text)}')

            chunk_size = 10000
            num_workers = 5
            chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
            with ThreadPoolExecutor(max_workers=num_workers) as executor:
                results = list(executor.map(extract_emails_from_chunk, chunks))

            emails = [email for sublist in results for email in sublist]
            # logging.info(f'emails: {emails}')

            # emails = []
            # emailRegex = re.compile(r'''(
            #                 ([a-zA-Z0-9._%+-])+    #User name
            #                 (@)                    #@ symbol
            #                 ([a-zA-Z0-9.-])+       #domain name
            #                 )''', re.VERBOSE)
            # for groups in emailRegex.findall(text):
            #     logging.info(f'groups: {groups}')
            #     emails.append(groups[0])
            # Email = list(dict.fromkeys(emails))
    except:
        logging.error(traceback.format_exc())
    return emails


def get_phones(str1):
    phones = []
    html1 = Selector(text=str1.lower())

    try:
        phones = [parse_field('./@href', d1).replace('tel:', '').strip() for d1 in html1.xpath('//*[contains(@href, "tel:")]')]
    except:
        ''

    if not phones:
        for match in phonenumbers.PhoneNumberMatcher(str1, "US"):
            phones.append(phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.NATIONAL))

    if not phones:
        for match in re.findall(r'\(?[0-9]{3}\)?[ .-]?[0-9]{3}[ .-]?[0-9]{4}', parse_field('.//body', html1)):
            phones.append(format_phone_number(match))

    if phones:
        phones = list(dict.fromkeys(phones))

    return phones


def get_phones_old(text):
    Phone = None
    try:
        if text:
            tab = []
            for match in phonenumbers.PhoneNumberMatcher(text, "US"):
                tab.append(phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.NATIONAL))
            Phone = list(dict.fromkeys(tab))
    except:
        ""
    return Phone

def format_phone_number(phone_number):
    try:
        parsed_number = phonenumbers.parse(phone_number, "US")
        phone_number = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.NATIONAL)
    except:
        logging.exception(traceback.format_exc())
    return phone_number

def get_websites(text):
    urls = None
    try:
        if text:
            extractor = URLExtract()
            urls = list(dict.fromkeys(extractor.find_urls(text)))
    except:
        ""
    return urls

# https://stackoverflow.com/questions/312443/how-do-you-split-a-list-into-evenly-sized-chunks
def split_list_into_sized_chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def check_string_contains_url(content):
    url_exist = False
    re_equ = r"(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))"
    if preg_match(patt='\d+', subj=content):
        url_exist = True

    return url_exist

def get_text_from_image(image_path):
    text = ''
    try:
        path_to_tesseract = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        img = Image.open(image_path)
        pytesseract.tesseract_cmd = path_to_tesseract
        text = pytesseract.image_to_string(img)[:-1]
    except:
        logging.error(traceback.format_exc())

    return text

def difference_between_two_dates(date1, date2, format):
    count_days = 0
    try:
        date1 = datetime.strptime(date1, format)
        date2 = datetime.strptime(date2, format)
        count_days = abs((date2 - date1).days)
    except:
        logging.error(traceback.format_exc())
    return count_days

def current_date(format):
    # format = '%Y-%m-%d'
    current_date = None
    try:
        now = datetime.now()
        current_date = now.strftime(format)
    except:
        logging.error(traceback.format_exc())
    return current_date

def yesterday_date(format):
    # format = '%Y-%m-%d'
    yesterday_date = None
    try:
        yesterday_date = datetime.strftime(datetime.now() - timedelta(1), format)
    except:
        logging.error(traceback.format_exc())
    return yesterday_date

def parse_name(Name):
    Name_first = Name_middle1 = Name_middle2 = Name_middle10 = Name_middle20 = Name_last = ''
    if Name:
        try:
            Name = ' '.join([n for n in Name.split() if len(n)>2])
            HName_1 = HumanName(Name.lower())
            # print('HName_1 = ', HName_1.as_dict())
            try:
                Name_first = HName_1.first.strip()
            except:
                ''
            try:
                if ' ' in HName_1.middle:
                    try:
                        Name_middle1 = HName_1.middle.strip().split(' ')[0].strip()
                    except:
                        ''
                    try:
                        Name_middle2 = HName_1.middle.strip().split(' ')[1].strip()
                    except:
                        ''
                else:
                    Name_middle1 = HName_1.middle.strip()

                if Name_middle1:
                    Name_middle10 = Name_middle1[0].strip()

                if Name_middle2:
                    Name_middle20 = Name_middle2[0].strip()
            except:
                ''
            try:
                Name_last = HName_1.last.strip()
            except:
                ''
        except:
            logging.error(traceback.format_exc())

    dict_name = {'first': Name_first,
                 'middle1': Name_middle1,
                 'middle2': Name_middle2,
                 'middle10': Name_middle10,
                 'middle20': Name_middle20,
                 'last': Name_last}

    # logging.info(f'Name = {Name}')
    # logging.info(f'Name_first = {Name_first}')
    # logging.info(f'Name_middle1 = {Name_middle1}')
    # logging.info(f'Name_middle10 = {Name_middle10}')
    # logging.info(f'Name_middle2 = {Name_middle2}')
    # logging.info(f'Name_middle20 = {Name_middle20}')
    # logging.info(f'Name_last = {Name_last}')
    # logging.info(f'dict_name = {dict_name}')
    # logging.info('============================================')

    return dict_name


def get_title_page(html1):
    title = ''
    try:
        title = parse_field('//title', html1).lower().strip()
    except:
        ''
    return title

def parse_field(selector, html1):
    value = ''
    try:
        value = html1.xpath(f'normalize-space({selector})').get()
    except:
        ''
    return value

def convert_ago_to_date(date_ago, format):
    # format = '%Y-%m-%d'
    date_converted = datetime.now()
    try:
        time_parts = date_ago.split(" ")
        num = int(time_parts[0])  # Convert the number to an integer
        unit = time_parts[1]  # Get the unit of time (e.g. "hours", "days", etc.)

        # Get the current date and time
        now = datetime.now()

        # Subtract the specified amount of time from the current date and time
        if "second" in unit:
            date_converted = now - timedelta(seconds=num)
        elif "minute" in unit:
            date_converted = now - timedelta(minutes=num)
        elif "hour" in unit:
            date_converted = now - timedelta(hours=num)
        elif "day" in unit:
            date_converted = now - timedelta(days=num)
        elif "week" in unit:
            date_converted = now - timedelta(weeks=num)
        elif "month" in unit:
            date_converted = now - timedelta(days=num * 30)  # Assuming a month has 30 days
        elif "year" in unit:
            date_converted = now - timedelta(days=num * 365)  # Assuming a year has 365 days

        date_converted = date_converted.strftime(format)
    except:
        logging.error(traceback.format_exc())
    return date_converted

def current_timestamp():
    now = datetime.now()
    timestamp = int(now.timestamp())
    return timestamp