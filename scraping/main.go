package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"
)

type image struct {
	Alt string `json:"alt"`
	Src string `json:"src"`
}

func createDirectory(dir string) error {
	if err := os.Mkdir(dir, 0755); err != nil && !os.IsExist(err) {
		log.Println("fail to create directory, ", dir)
		return err
	}
	return nil
}

func getHTTPClient() *http.Client {
	client := &http.Client{}
	var zeroDialer net.Dialer
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		return zeroDialer.DialContext(ctx, "tcp4", addr)
	}
	client.Transport = transport
	return client
}

func min(min time.Duration, value time.Duration) time.Duration {
	if value < min {
		return value
	}
	return min
}

func wait(count int) {
	time.Sleep(min(time.Second*time.Duration(math.Pow(2, float64(count))), time.Second*32))
}

func retry(c *http.Client, req *http.Request) ([]byte, error) {
	retried := 0
	for {
		resp, err := c.Do(req)
		if err != nil {
			if retried < 5 {
				retried += 1
				wait(retried)
				continue
			}
			return nil, err
		}
		img, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}
		resp.Body.Close()
		if len(img) == 0 {
			if retried < 5 {
				retried += 1
				wait(retried)
				continue
			}
			return nil, errors.New("dowloaded image is null")
		}
		return img, nil
	}
}

func getImages(images []image, dir string) error {
	client := getHTTPClient()
	for _, image := range images {
		req, err := http.NewRequest("GET", image.Src, nil)
		if err != nil {
			return err
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0")
		img, err := retry(client, req)
		if err != nil {
			return err
		}
		basename := filepath.Base(image.Src)
		if err := ioutil.WriteFile(fmt.Sprintf("%s/%s_%s", dir, image.Alt, basename), img, 0755); err != nil {
			return err
		}
	}
	return nil
}

func getImagesWithCurl(images []image, dir string) error {
	for _, image := range images {
		filename := fmt.Sprintf("%s/%s_%s", dir, image.Alt, filepath.Base(image.Src))
		cmd := exec.Command("curl", image.Src, "-o", filename)
		if err := cmd.Run(); err != nil {
			return err
		}
		time.Sleep(time.Second)
	}
	return nil
}

type patternFunc = func(alt, name string) bool

func defaultPattern(alt, name string) bool {
	return true
}

func simplePattern(alt, name string) bool {
	return alt != "" && (strings.Contains(alt, name) || strings.Contains(name, alt))
}

type ListForSave struct {
	URL  string `json:"url"`
	Name string `json:"name"`
}

func main() {
	var (
		dir     string
		list    string
		source  string
		pattern patternFunc = defaultPattern
	)
	flag.StringVar(&dir, "dir", "", "Save directory")
	flag.StringVar(&list, "list", "", "URL list file for save")
	flag.StringVar(&source, "source", "", "Source web site")
	flag.Parse()

	if source == "" {
		pattern = simplePattern
	}

	listdata, err := ioutil.ReadFile(list)
	if err != nil {
		log.Fatal(err)
	}

	var listForSave []ListForSave
	if err := json.Unmarshal(listdata, &listForSave); err != nil {
		log.Fatal(err)
	}

	if err := createDirectory(dir); err != nil {
		log.Fatalln(err)
	}

	c := colly.NewCollector()

	for _, d := range listForSave {
		images := make([]image, 0)

		c.OnHTML("img", func(h *colly.HTMLElement) {
			alt := h.Attr("alt")
			if !pattern(alt, d.Name) {
				return
			}
			src := h.Attr("src")
			newImage := image{
				Alt: alt,
				Src: src,
			}
			images = append(images, newImage)
		})

		c.Visit(d.URL)

		data, err := json.MarshalIndent(images, "", "  ")
		if err != nil {
			log.Fatalln(err)
		}
		if err := ioutil.WriteFile(path.Join(dir, fmt.Sprintf("%s.json", d.Name)), data, 0755); err != nil {
			log.Fatalln(err)
		}
	}
}
