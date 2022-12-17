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
	"path/filepath"
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

func main() {
	var (
		url string
		dir string
	)
	flag.StringVar(&url, "url", "", "URL for scraping")
	flag.StringVar(&dir, "dir", "", "Save directory")
	flag.Parse()

	c := colly.NewCollector()
	images := make([]image, 0)

	c.OnHTML("img", func(h *colly.HTMLElement) {
		alt := h.Attr("alt")
		src := h.Attr("src")
		newImage := image{
			Alt: alt,
			Src: src,
		}
		images = append(images, newImage)
	})

	c.Visit(url)

	// if err := createDirectory(dir); err != nil {
	// 	log.Fatalln(err)
	// }
	// if err := getImages(images, dir); err != nil {
	// 	log.Fatalln(err)
	// }
	data, err := json.MarshalIndent(images, "", "  ")
	if err != nil {
		log.Fatalln(err)
	}
	if err := ioutil.WriteFile(fmt.Sprintf("%s.json", dir), data, 0755); err != nil {
		log.Fatalln(err)
	}
}
