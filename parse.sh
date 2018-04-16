#!/bin/bash 

# Deps: ffmpeg https://www.ffmpeg.org/
FILE=$1

# echo $FILE "${FILE}.wav"

# http://0.0.0.0:5566/uploads/sunset.mp3
# '#' remove minimal matching prefixes
# '##' remove maximal matching prefixes
# '%' remove minimal matching suffixes
# '%%' remove maximal matching suffixes
# FILE=http://0.0.0.0:5566/uploads/sunset.mp3
# FILE=../uploads/sunset.mp3
# echo ${FILE#/*/}  # ==> user/src/prog.c
# echo ${FILE##/*/} # ==> prog.c
# echo ${FILE%/*}   # ==> /home/user/src
# echo ${FILE%%/*}  # ==> nil
# echo ${FILE%.c}   # ==> /home/user/src/prog

FILE_NAME=${FILE##http:/*/}     # URL
FILE_NAME=${FILE_NAME##../*/}   # 相对路径
FILE_NAME=${FILE_NAME##/*/}     # 绝对路径

PARSED_DIR=${FILE%/*}

ffmpeg -i $FILE  -acodec pcm_s16le -f s16le -ac 1 -ar 16000  -y "$PARSED_DIR/$FILE_NAME.pcm"